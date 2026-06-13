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
  default     = "therumunai-example"
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

variable "site_domain" {
  description = "Public site domain (placeholder)."
  type        = string
  default     = "example.com"
}
