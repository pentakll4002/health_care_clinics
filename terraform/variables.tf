# ============================================================
# Terraform - Input Variables
# ============================================================

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "health-clinics"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "southeastasia"
}

# ---- Database ----
variable "postgres_db" {
  description = "PostgreSQL database name"
  type        = string
  default     = "health_clinics"
}

variable "postgres_user" {
  description = "PostgreSQL admin username"
  type        = string
  default     = "health_clinics"
}

variable "postgres_password" {
  description = "PostgreSQL admin password"
  type        = string
  sensitive   = true
}

# ---- Application Secrets ----
variable "jwt_secret" {
  description = "JWT signing secret"
  type        = string
  sensitive   = true
  default     = "healthClinicsSecretKeyForJWT2025VeryLongSecretKey"
}

variable "groq_api_key" {
  description = "Groq API key for AI service"
  type        = string
  sensitive   = true
  default     = ""
}

variable "langchain_api_key" {
  description = "LangChain API key for tracing"
  type        = string
  sensitive   = true
  default     = ""
}

variable "mail_username" {
  description = "SMTP mail username"
  type        = string
  default     = ""
}

variable "mail_password" {
  description = "SMTP mail password"
  type        = string
  sensitive   = true
  default     = ""
}

# ---- Container App Scaling ----
variable "backend_cpu" {
  description = "CPU cores for backend container"
  type        = number
  default     = 0.5
}

variable "backend_memory" {
  description = "Memory (Gi) for backend container"
  type        = string
  default     = "1Gi"
}

variable "ai_service_cpu" {
  description = "CPU cores for AI service container"
  type        = number
  default     = 1.0
}

variable "ai_service_memory" {
  description = "Memory (Gi) for AI service container"
  type        = string
  default     = "2Gi"
}

variable "frontend_cpu" {
  description = "CPU cores for frontend container"
  type        = number
  default     = 0.25
}

variable "frontend_memory" {
  description = "Memory (Gi) for frontend container"
  type        = string
  default     = "0.5Gi"
}
