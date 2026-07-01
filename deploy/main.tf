# Sanitized example — Therumunai infrastructure reference.
#
# This file defines the core AWS resource topologies needed to run the platform.
# All real deployments, state, and credentials live in a separate private repository.

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.52"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
      Repo        = "public-sanitized-example"
    }
  }
}

locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

# ---------------------------------------------------------------------------
# Network Data Sources (Default VPC Integration)
# ---------------------------------------------------------------------------
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# ---------------------------------------------------------------------------
# S3 Bucket — Citizen Photo Uploads
# ---------------------------------------------------------------------------
resource "aws_s3_bucket" "photos" {
  bucket        = var.photos_bucket_name
  force_destroy = var.environment != "prod"
}

# Block all public ACLs and bucket policies to enforce access control
resource "aws_s3_bucket_public_access_block" "photos" {
  bucket = aws_s3_bucket.photos.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CORS configuration to allow direct-to-S3 uploads from the frontend
resource "aws_s3_bucket_cors_configuration" "photos" {
  bucket = aws_s3_bucket.photos.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT"]
    allowed_origins = var.cors_allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3600
  }
}

# ---------------------------------------------------------------------------
# CloudFront CDN — Static Assets & Public Photo Delivery
# ---------------------------------------------------------------------------
# CloudFront Origin Access Control (OAC) for S3
resource "aws_cloudfront_origin_access_control" "photos" {
  name                              = "${local.name_prefix}-s3-oac"
  description                       = "OAC for S3 photo delivery"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name              = aws_s3_bucket.photos.bucket_regional_domain_name
    origin_id                = "S3Photos"
    origin_access_control_id = aws_cloudfront_origin_access_control.photos.id
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Therumunai S3 Photos Delivery CDN"
  default_root_object = ""

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3Photos"

    forwarded_values {
      query_string = false
      headers      = ["Origin", "Access-Control-Request-Headers", "Access-Control-Request-Method"]

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
    compress               = true
  }

  price_class = "PriceClass_200" # Focuses on performance in APAC (including India)

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

# Policy to allow CloudFront OAC to read S3 bucket objects
resource "aws_s3_bucket_policy" "allow_cloudfront" {
  bucket = aws_s3_bucket.photos.id
  policy = data.aws_iam_policy_document.allow_cloudfront.json
}

data "aws_iam_policy_document" "allow_cloudfront" {
  statement {
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.photos.arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.cdn.arn]
    }
  }
}

# ---------------------------------------------------------------------------
# Database Security Group & RDS PostgreSQL + PostGIS (MVP Cost Guardrail)
# ---------------------------------------------------------------------------
resource "aws_security_group" "db" {
  name        = "${local.name_prefix}-db-sg"
  description = "Controls access to RDS PostgreSQL instance"
  vpc_id      = data.aws_vpc.default.id

  # Allow inbound database connections from the Lambda function security group
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda.id]
  }

  # Optional rule for local access during development (if db_publicly_accessible = true)
  # Security notice: If enabling this, restrict CIDR block to developer IP.
  dynamic "ingress" {
    for_each = var.db_publicly_accessible ? [1] : []
    content {
      description = "WARNING: Broad local access for development migrations"
      from_port   = 5432
      to_port     = 5432
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_subnet_group" "postgis" {
  name       = "${local.name_prefix}-db-subnet-group"
  subnet_ids = data.aws_subnets.default.ids

  tags = {
    Name = "${local.name_prefix}-db-subnet-group"
  }
}

resource "aws_db_instance" "postgis" {
  identifier             = "${local.name_prefix}-db"
  allocated_storage      = 20
  max_allocated_storage  = 100
  storage_type           = "gp3"
  engine                 = "postgres"
  engine_version         = "16.1"
  instance_class         = var.db_instance_class
  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.postgis.name
  vpc_security_group_ids = [aws_security_group.db.id]
  publicly_accessible    = var.db_publicly_accessible
  skip_final_snapshot    = var.environment != "prod"

  # Enforce encrypted storage
  storage_encrypted = true

  lifecycle {
    ignore_changes = [
      password, # Handled out-of-band by user
    ]
  }
}

# ---------------------------------------------------------------------------
# Lambda Security Group, IAM, and Function Stub
# ---------------------------------------------------------------------------
resource "aws_security_group" "lambda" {
  name        = "${local.name_prefix}-lambda-sg"
  description = "Controls network egress for Lambda handler"
  vpc_id      = data.aws_vpc.default.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda" {
  name = "${local.name_prefix}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Policies for CloudWatch, VPC execution, and S3
resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_policy" "lambda_s3" {
  name = "${local.name_prefix}-lambda-s3-policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:PutObject"
        ]
        Effect   = "Allow"
        Resource = "${aws_s3_bucket.photos.arn}/*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_s3" {
  role       = aws_iam_role.lambda.name
  policy_arn = aws_iam_policy.lambda_s3.arn
}

# Create a zip of dummy index.js to bootstrap the Lambda function
data "archive_file" "lambda_stub" {
  type        = "zip"
  output_path = "${path.module}/dummy_lambda.zip"

  source {
    content  = "exports.handler = async (event) => ({ statusCode: 200, body: JSON.stringify({ message: 'stub bootstrap' }) });"
    filename = "index.js"
  }
}

resource "aws_lambda_function" "submit" {
  filename         = data.archive_file.lambda_stub.output_path
  function_name    = "${local.name_prefix}-submit-handler"
  role             = aws_iam_role.lambda.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  source_code_hash = data.archive_file.lambda_stub.output_base64sha256
  timeout          = 15
  memory_size      = 256

  vpc_config {
    subnet_ids         = data.aws_subnets.default.ids
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      PHOTOS_BUCKET_NAME   = aws_s3_bucket.photos.id
      DB_HOST              = aws_db_instance.postgis.address
      DB_PORT              = aws_db_instance.postgis.port
      DB_NAME              = aws_db_instance.postgis.db_name
      DB_USER              = aws_db_instance.postgis.username
      DB_PASS              = var.db_password
      PHOTO_MAX_SIZE_MB    = tostring(var.photo_max_size_mb)
      CORS_ALLOWED_ORIGINS = join(",", var.cors_allowed_origins)
    }
  }
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${aws_lambda_function.submit.function_name}"
  retention_in_days = 14
}

# ---------------------------------------------------------------------------
# API Gateway HTTP API (Serverless Entrypoint)
# ---------------------------------------------------------------------------
resource "aws_apigatewayv2_api" "reports" {
  name          = "${local.name_prefix}-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_credentials = false
    allow_headers     = ["content-type", "authorization"]
    allow_methods     = ["GET", "POST", "OPTIONS"]
    allow_origins     = var.cors_allowed_origins
    max_age           = 3600
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.reports.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.reports.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.submit.arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "presign" {
  api_id    = aws_apigatewayv2_api.reports.id
  route_key = "GET /presign"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "submit_report" {
  api_id    = aws_apigatewayv2_api.reports.id
  route_key = "POST /reports"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "get_reports" {
  api_id    = aws_apigatewayv2_api.reports.id
  route_key = "GET /reports"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.submit.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.reports.execution_arn}/*/*"
}

# ---------------------------------------------------------------------------
# AWS WAF v2 rate-limiting (Anti-Abuse Control)
# ---------------------------------------------------------------------------
resource "aws_wafv2_web_acl" "api" {
  count       = var.enable_waf ? 1 : 0
  name        = "${local.name_prefix}-waf-acl"
  description = "Basic rate-limiting protection for the Therumunai API"
  scope       = "REGIONAL"

  default_action {
    allow {}
  }

  rule {
    name     = "IPRateLimit"
    priority = 1

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 100
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "IPRateLimitMetric"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "WAFACLMetric"
    sampled_requests_enabled   = true
  }
}

resource "aws_wafv2_web_acl_association" "api" {
  count        = var.enable_waf ? 1 : 0
  resource_arn = aws_apigatewayv2_stage.default.arn
  web_acl_arn  = aws_wafv2_web_acl.api[0].arn
}

# ---------------------------------------------------------------------------
# AWS Budget Alarm (Cost Guardrail)
# ---------------------------------------------------------------------------
resource "aws_budgets_budget" "monthly" {
  name              = "${local.name_prefix}-monthly-budget"
  budget_type       = "COST"
  limit_amount      = tostring(var.monthly_budget_usd)
  limit_unit        = "USD"
  time_unit         = "MONTHLY"
  time_period_start = "2026-01-01_00:00"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.alert_email]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.alert_email]
  }
}
