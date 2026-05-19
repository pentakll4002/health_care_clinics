# ============================================================
# Terraform - Outputs
# ============================================================

output "resource_group_name" {
  description = "Name of the Azure Resource Group"
  value       = azurerm_resource_group.main.name
}

output "acr_login_server" {
  description = "Azure Container Registry login server URL"
  value       = azurerm_container_registry.acr.login_server
}

output "acr_admin_username" {
  description = "ACR admin username"
  value       = azurerm_container_registry.acr.admin_username
}

output "acr_admin_password" {
  description = "ACR admin password"
  value       = azurerm_container_registry.acr.admin_password
  sensitive   = true
}

output "postgres_fqdn" {
  description = "PostgreSQL server fully qualified domain name"
  value       = azurerm_postgresql_flexible_server.main.fqdn
}

output "frontend_url" {
  description = "Frontend application URL (public)"
  value       = "https://${azurerm_container_app.frontend.ingress[0].fqdn}"
}

output "backend_fqdn" {
  description = "Backend internal FQDN"
  value       = azurerm_container_app.backend.ingress[0].fqdn
}

output "ai_service_fqdn" {
  description = "AI Service internal FQDN"
  value       = azurerm_container_app.ai_service.ingress[0].fqdn
}
