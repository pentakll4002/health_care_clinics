# ============================================================
# Terraform Variables - Development Environment
# Copy and modify for staging/prod
# ============================================================

project_name = "health-clinics"
environment  = "dev"
location     = "southeastasia"

# Database
postgres_db   = "health_clinics"
postgres_user = "health_clinics"
# postgres_password = "SET_VIA_ENV_OR_TFVARS"

# Application
# jwt_secret        = "SET_VIA_ENV_OR_TFVARS"
# groq_api_key      = "SET_VIA_ENV_OR_TFVARS"
# langchain_api_key = "SET_VIA_ENV_OR_TFVARS"

# Container Resources
backend_cpu       = 0.5
backend_memory    = "1Gi"
ai_service_cpu    = 1.0
ai_service_memory = "2Gi"
frontend_cpu      = 0.25
frontend_memory   = "0.5Gi"
