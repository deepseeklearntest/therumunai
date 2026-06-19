# Sanitized example — Outputs for the Therumunai infrastructure reference.
# Placeholders only. Real production infra lives in a separate private repository.

output "api_endpoint" {
  description = "The HTTP invoke URL of API Gateway stage."
  value       = aws_apigatewayv2_stage.default.invoke_url
}

output "photos_bucket" {
  description = "The S3 bucket name created for photo uploads."
  value       = aws_s3_bucket.photos.id
}

output "cloudfront_domain" {
  description = "The CloudFront CDN domain name for public photo viewing."
  value       = aws_cloudfront_distribution.cdn.domain_name
}

output "rds_endpoint" {
  description = "The PostgreSQL database connection endpoint."
  value       = aws_db_instance.postgis.endpoint
}
