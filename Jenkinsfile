// ============================================================
// Jenkinsfile - Health Clinics CI/CD Pipeline
// Build Docker images → Push to ACR → Deploy via Terraform
// ============================================================

pipeline {
    agent any

    environment {
        // Azure Service Principal credentials (configure in Jenkins)
        AZURE_CREDENTIALS    = credentials('azure-service-principal')
        ARM_CLIENT_ID        = "${AZURE_CREDENTIALS_CLIENT_ID}"
        ARM_CLIENT_SECRET    = "${AZURE_CREDENTIALS_CLIENT_SECRET}"
        ARM_TENANT_ID        = "${AZURE_CREDENTIALS_TENANT_ID}"
        ARM_SUBSCRIPTION_ID  = "${AZURE_CREDENTIALS_SUBSCRIPTION_ID}"

        // Project settings
        PROJECT_NAME     = 'health-clinics'
        ENVIRONMENT      = "${params.ENVIRONMENT ?: 'dev'}"
        IMAGE_TAG        = "${env.BUILD_NUMBER}-${env.GIT_COMMIT?.take(7) ?: 'latest'}"

        // Terraform
        TF_VAR_postgres_password = credentials('hc-postgres-password')
        TF_VAR_jwt_secret        = credentials('hc-jwt-secret')
        TF_VAR_groq_api_key      = credentials('hc-groq-api-key')
        TF_VAR_langchain_api_key = credentials('hc-langchain-api-key')
        TF_VAR_mail_password     = credentials('hc-mail-password')
    }

    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['dev', 'staging', 'prod'],
            description: 'Target deployment environment'
        )
        booleanParam(
            name: 'SKIP_TESTS',
            defaultValue: false,
            description: 'Skip test stage'
        )
        booleanParam(
            name: 'DEPLOY_INFRA',
            defaultValue: false,
            description: 'Run Terraform to create/update infrastructure'
        )
        booleanParam(
            name: 'DEPLOY_APPS',
            defaultValue: true,
            description: 'Build and deploy Docker images'
        )
    }

    options {
        timeout(time: 45, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
    }

    stages {
        // ---- Stage 1: Checkout ----
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    echo "🏥 Health Clinics CI/CD Pipeline"
                    echo "Environment: ${ENVIRONMENT}"
                    echo "Image Tag: ${IMAGE_TAG}"
                    echo "Branch: ${env.GIT_BRANCH}"
                }
            }
        }

        // ---- Stage 2: Test (parallel) ----
        stage('Test') {
            when {
                expression { return !params.SKIP_TESTS }
            }
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            bat 'mvn test -B'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true,
                                  testResults: 'backend/target/surefire-reports/*.xml'
                        }
                    }
                }
                stage('AI Service Tests') {
                    steps {
                        dir('ai-service') {
                            bat 'pip install -r requirements.txt'
                            bat 'python -m pytest tests/ --junitxml=test-results.xml || true'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true,
                                  testResults: 'ai-service/test-results.xml'
                        }
                    }
                }
            }
        }

        // ---- Stage 3: Terraform Infrastructure ----
        stage('Infrastructure') {
            when {
                expression { return params.DEPLOY_INFRA }
            }
            steps {
                dir('terraform') {
                    script {
                        // Initialize Terraform
                        bat 'terraform init -input=false'

                        // Plan changes
                        bat "terraform plan -var-file=environments/${ENVIRONMENT}.tfvars -out=tfplan -input=false"

                        // Apply (auto-approve for dev, manual for prod)
                        if (ENVIRONMENT == 'prod') {
                            input message: '⚠️ Apply Terraform changes to PRODUCTION?',
                                  ok: 'Apply'
                        }

                        bat 'terraform apply -auto-approve tfplan'

                        // Capture outputs for later stages
                        env.ACR_LOGIN_SERVER = bat(
                            script: 'terraform output -raw acr_login_server',
                            returnStdout: true
                        ).trim()
                        env.ACR_USERNAME = bat(
                            script: 'terraform output -raw acr_admin_username',
                            returnStdout: true
                        ).trim()
                    }
                }
            }
        }

        // ---- Stage 4: Get ACR Credentials ----
        stage('ACR Login') {
            when {
                expression { return params.DEPLOY_APPS }
            }
            steps {
                script {
                    // Get ACR credentials from Terraform state or Azure CLI
                    if (!env.ACR_LOGIN_SERVER) {
                        dir('terraform') {
                            bat 'terraform init -input=false'
                            env.ACR_LOGIN_SERVER = bat(
                                script: 'terraform output -raw acr_login_server',
                                returnStdout: true
                            ).trim()
                            env.ACR_USERNAME = bat(
                                script: 'terraform output -raw acr_admin_username',
                                returnStdout: true
                            ).trim()
                        }
                    }

                    // Login to ACR
                    bat "az acr login --name ${env.ACR_LOGIN_SERVER.split('\\.')[0]}"

                    echo "✅ Logged in to ACR: ${env.ACR_LOGIN_SERVER}"
                }
            }
        }

        // ---- Stage 5: Build & Push Docker Images (parallel) ----
        stage('Build & Push Images') {
            when {
                expression { return params.DEPLOY_APPS }
            }
            parallel {
                stage('Backend Image') {
                    steps {
                        script {
                            def imageName = "${env.ACR_LOGIN_SERVER}/${PROJECT_NAME}-backend"

                            bat """
                                docker build -f docker/dockerfiles/backend.Dockerfile ^
                                    -t ${imageName}:${IMAGE_TAG} ^
                                    -t ${imageName}:latest .
                            """
                            bat "docker push ${imageName}:${IMAGE_TAG}"
                            bat "docker push ${imageName}:latest"

                            echo "✅ Backend image pushed: ${imageName}:${IMAGE_TAG}"
                        }
                    }
                }
                stage('AI Service Image') {
                    steps {
                        script {
                            def imageName = "${env.ACR_LOGIN_SERVER}/${PROJECT_NAME}-ai-service"

                            bat """
                                docker build -f docker/dockerfiles/ai-service.Dockerfile ^
                                    -t ${imageName}:${IMAGE_TAG} ^
                                    -t ${imageName}:latest .
                            """
                            bat "docker push ${imageName}:${IMAGE_TAG}"
                            bat "docker push ${imageName}:latest"

                            echo "✅ AI Service image pushed: ${imageName}:${IMAGE_TAG}"
                        }
                    }
                }
                stage('Frontend Image') {
                    steps {
                        script {
                            def imageName = "${env.ACR_LOGIN_SERVER}/${PROJECT_NAME}-frontend"

                            bat """
                                docker build -f docker/dockerfiles/frontend.Dockerfile ^
                                    --build-arg VITE_API_URL=/api ^
                                    --build-arg VITE_AI_SERVICE_URL=/ai ^
                                    -t ${imageName}:${IMAGE_TAG} ^
                                    -t ${imageName}:latest .
                            """
                            bat "docker push ${imageName}:${IMAGE_TAG}"
                            bat "docker push ${imageName}:latest"

                            echo "✅ Frontend image pushed: ${imageName}:${IMAGE_TAG}"
                        }
                    }
                }
            }
        }

        // ---- Stage 6: Deploy to Azure Container Apps ----
        stage('Deploy') {
            when {
                expression { return params.DEPLOY_APPS }
            }
            steps {
                script {
                    def rgName = "${PROJECT_NAME}-${ENVIRONMENT}-rg"
                    def acrName = env.ACR_LOGIN_SERVER.split('\\.')[0]

                    echo "🚀 Deploying to Azure Container Apps..."

                    // Update backend
                    bat """
                        az containerapp update ^
                            --name ${PROJECT_NAME}-${ENVIRONMENT}-backend ^
                            --resource-group ${rgName} ^
                            --image ${env.ACR_LOGIN_SERVER}/${PROJECT_NAME}-backend:${IMAGE_TAG}
                    """

                    // Update AI service
                    bat """
                        az containerapp update ^
                            --name ${PROJECT_NAME}-${ENVIRONMENT}-ai-service ^
                            --resource-group ${rgName} ^
                            --image ${env.ACR_LOGIN_SERVER}/${PROJECT_NAME}-ai-service:${IMAGE_TAG}
                    """

                    // Update frontend
                    bat """
                        az containerapp update ^
                            --name ${PROJECT_NAME}-${ENVIRONMENT}-frontend ^
                            --resource-group ${rgName} ^
                            --image ${env.ACR_LOGIN_SERVER}/${PROJECT_NAME}-frontend:${IMAGE_TAG}
                    """

                    echo "✅ All services deployed successfully!"
                }
            }
        }

        // ---- Stage 7: Smoke Test ----
        stage('Smoke Test') {
            when {
                expression { return params.DEPLOY_APPS }
            }
            steps {
                script {
                    dir('terraform') {
                        def frontendUrl = bat(
                            script: 'terraform output -raw frontend_url',
                            returnStdout: true
                        ).trim()

                        echo "🔍 Running smoke tests on: ${frontendUrl}"

                        // Wait for deployment to stabilize
                        sleep(time: 30, unit: 'SECONDS')

                        // Test frontend
                        bat "curl -sf ${frontendUrl}/health || exit 1"

                        echo "✅ Smoke tests passed!"
                        echo "🌐 Application URL: ${frontendUrl}"
                    }
                }
            }
        }
    }

    post {
        success {
            echo """
            ✅ ====================================
            ✅ Pipeline completed successfully!
            ✅ Environment: ${ENVIRONMENT}
            ✅ Image Tag: ${IMAGE_TAG}
            ✅ ====================================
            """
        }
        failure {
            echo """
            ❌ ====================================
            ❌ Pipeline FAILED!
            ❌ Environment: ${ENVIRONMENT}
            ❌ Check the logs above for details.
            ❌ ====================================
            """
        }
        always {
            // Clean up Docker images to save space
            script {
                bat 'docker image prune -f || true'
            }
        }
    }
}
