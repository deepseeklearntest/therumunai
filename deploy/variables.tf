# Sanitized example — variable declarations for the Therumunai infrastructure reference.
# Placeholders only. Real production infra lives in a separate private repository.

variable "aws_region" {
  description = "AWS region to deploy into."
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Lowercase name prefix for all resources."
  type        = string
  default     = "therumunai"
}

variable "environment" {
  description = "Deployment environment label (dev | staging | prod)."
  type        = string
  default     = "dev"
}

variable "photos_bucket_name" {
  description = "Globally-unique S3 bucket name for citizen photo uploads."
  type        = string
}

variable "db_instance_class" {
  description = "RDS instance class. MVP guardrail: start with db.t4g.micro."
  type        = string
  default     = "db.t4g.micro"
}

variable "db_name" {
  description = "PostgreSQL database name."
  type        = string
  default     = "therumunai"
}

variable "db_username" {
  description = "PostgreSQL master username."
  type        = string
  default     = "therumunai_admin"
}

variable "db_password" {
  description = "PostgreSQL master password. Sourced via environment variable TF_VAR_db_password or a secret store."
  type        = string
  sensitive   = true
}

variable "db_publicly_accessible" {
  description = "Whether the database should be publicly accessible (useful for local migrations during dev)."
  type        = bool
  default     = false
}

variable "site_domain" {
  description = "Public site domain (placeholder)."
  type        = string
  default     = "example.com"
}

variable "cors_allowed_origins" {
  description = "List of allowed origins for S3 CORS and API Gateway CORS."
  type        = list(string)
  default     = ["http://localhost:3000"]
}

variable "photo_max_size_mb" {
  description = "Maximum size in megabytes for uploaded photos."
  type        = number
  default     = 10
}

variable "monthly_budget_usd" {
  description = "Monthly budget limit in USD for AWS Budgets email alerts."
  type        = number
  default     = 25
}

variable "alert_email" {
  description = "Email address to receive billing and budget alerts."
  type        = string
}

variable "enable_waf" {
  description = "Enable AWS WAF rate-limiting for the API Gateway endpoint."
  type        = bool
  default     = true
}
