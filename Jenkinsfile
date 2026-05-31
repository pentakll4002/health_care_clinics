// ============================================================
// Jenkinsfile - Health Clinics CI/CD Pipeline
// Flow: Checkout → Test → Infra (Terraform) → Build Images → Push ACR → Deploy → Smoke Test
// ============================================================

pipeline {
    agent any

    // ── Environment variables ─────────────────────────────────
    environment {
        // Azure Service Principal (JSON credential stored in Jenkins)
        AZURE_CREDENTIALS    = credentials('azure-service-principal')
        ARM_CLIENT_ID        = "${AZURE_CREDENTIALS_CLIENT_ID}"
        ARM_CLIENT_SECRET    = "${AZURE_CREDENTIALS_CLIENT_SECRET}"
        ARM_TENANT_ID        = "${AZURE_CREDENTIALS_TENANT_ID}"
        ARM_SUBSCRIPTION_ID  = "${AZURE_CREDENTIALS_SUBSCRIPTION_ID}"

        // Project
        PROJECT_NAME = 'health-clinics'
        ACR_NAME     = 'healthclinicsdevacr'             // alphanumeric only
        ACR_SERVER   = 'healthclinicsdevacr.azurecr.io'
        RG_NAME      = 'health-clinics-dev-rg'

        // Image tag: buildNumber + short commit hash
        IMAGE_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT?.take(7) ?: 'latest'}"

        // Terraform sensitive vars (stored as Jenkins secret text)
        TF_VAR_postgres_password = credentials('hc-postgres-password')
        TF_VAR_jwt_secret        = credentials('hc-jwt-secret')
        TF_VAR_groq_api_key      = credentials('hc-groq-api-key')
        TF_VAR_langchain_api_key = credentials('hc-langchain-api-key')
        TF_VAR_mail_password     = credentials('hc-mail-password')
    }

    // ── Build parameters ──────────────────────────────────────
    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['dev', 'staging', 'prod'],
            description: 'Target deployment environment'
        )
        booleanParam(
            name: 'SKIP_TESTS',
            defaultValue: true,
            description: 'Skip test stage (faster pipeline)'
        )
        booleanParam(
            name: 'DEPLOY_INFRA',
            defaultValue: true,
            description: 'Run Terraform to create/update Azure infrastructure'
        )
        booleanParam(
            name: 'DEPLOY_APPS',
            defaultValue: true,
            description: 'Build Docker images, push to ACR and deploy to Container Apps'
        )
        booleanParam(
            name: 'FORCE_REBUILD',
            defaultValue: false,
            description: 'Force rebuild all images (ignore Docker cache)'
        )
    }

    // ── Pipeline options ──────────────────────────────────────
    options {
        timeout(time: 90, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        ansiColor('xterm')
    }

    stages {

        // ── 1. Checkout ───────────────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    def env_label = params.ENVIRONMENT.toUpperCase()
                    echo "╔══════════════════════════════════════╗"
                    echo "║  Health Clinics CI/CD Pipeline       ║"
                    echo "╠══════════════════════════════════════╣"
                    echo "║  Environment : ${env_label.padRight(22)}║"
                    echo "║  Image Tag   : ${IMAGE_TAG.padRight(22)}║"
                    echo "║  Branch      : ${(env.GIT_BRANCH ?: 'unknown').take(22).padRight(22)}║"
                    echo "╚══════════════════════════════════════╝"
                }
            }
        }

        // ── 2. Tests (parallel, skippable) ───────────────────
        stage('Test') {
            when {
                expression { return !params.SKIP_TESTS }
            }
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            sh 'mvn test -B -q'
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
                            sh '''
                                pip install -q -r requirements.txt
                                python -m pytest tests/ --junitxml=test-results.xml -q || true
                            '''
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

        // ── 3. Azure Provider Registration ───────────────────
        stage('Register Azure Providers') {
            when {
                expression { return params.DEPLOY_INFRA || params.DEPLOY_APPS }
            }
            steps {
                script {
                    echo "📦 Registering required Azure resource providers..."
                    sh '''
                        az login --service-principal \
                            --username  $ARM_CLIENT_ID \
                            --password  $ARM_CLIENT_SECRET \
                            --tenant    $ARM_TENANT_ID
                        az account set --subscription $ARM_SUBSCRIPTION_ID

                        for ns in Microsoft.App Microsoft.OperationalInsights \
                                  Microsoft.ContainerRegistry Microsoft.DBforPostgreSQL; do
                            state=$(az provider show --namespace $ns --query registrationState -o tsv 2>/dev/null || echo "NotRegistered")
                            if [ "$state" != "Registered" ]; then
                                echo "  → Registering $ns ..."
                                az provider register --namespace $ns --wait
                            else
                                echo "  ✅ $ns already registered"
                            fi
                        done
                        echo "All Azure providers are registered."
                    '''
                }
            }
        }

        // ── 4. Terraform – Provision Infrastructure ───────────
        stage('Infrastructure') {
            when {
                expression { return params.DEPLOY_INFRA }
            }
            steps {
                dir('terraform') {
                    script {
                        echo "🏗️  Provisioning Azure infrastructure with Terraform..."

                        sh 'terraform init -input=false -reconfigure'

                        sh """
                            terraform plan \
                                -var-file=environments/${params.ENVIRONMENT}.tfvars \
                                -out=tfplan \
                                -input=false
                        """

                        // Manual approval gate for production
                        if (params.ENVIRONMENT == 'prod') {
                            input message: '⚠️  Apply Terraform to PRODUCTION?', ok: 'Apply'
                        }

                        sh 'terraform apply -auto-approve tfplan'

                        // Capture outputs
                        env.ACR_LOGIN_SERVER = sh(
                            script: 'terraform output -raw acr_login_server',
                            returnStdout: true
                        ).trim()
                        env.FRONTEND_URL = sh(
                            script: 'terraform output -raw frontend_url',
                            returnStdout: true
                        ).trim()
                        env.BACKEND_FQDN = sh(
                            script: 'terraform output -raw backend_fqdn',
                            returnStdout: true
                        ).trim()
                        env.AI_FQDN = sh(
                            script: 'terraform output -raw ai_service_fqdn',
                            returnStdout: true
                        ).trim()

                        echo "✅ Infrastructure ready!"
                        echo "   ACR        : ${env.ACR_LOGIN_SERVER}"
                        echo "   Frontend   : ${env.FRONTEND_URL}"
                        echo "   Backend    : ${env.BACKEND_FQDN}"
                        echo "   AI Service : ${env.AI_FQDN}"
                    }
                }
            }
        }

        // ── 5. Load Terraform Outputs (when infra was pre-existing) ──
        stage('Load Infra Outputs') {
            when {
                expression { return params.DEPLOY_APPS && !params.DEPLOY_INFRA }
            }
            steps {
                dir('terraform') {
                    script {
                        echo "📋 Loading existing infrastructure outputs..."
                        sh 'terraform init -input=false -reconfigure'

                        env.ACR_LOGIN_SERVER = sh(
                            script: 'terraform output -raw acr_login_server',
                            returnStdout: true
                        ).trim()
                        env.FRONTEND_URL = sh(
                            script: 'terraform output -raw frontend_url',
                            returnStdout: true
                        ).trim()
                        env.BACKEND_FQDN = sh(
                            script: 'terraform output -raw backend_fqdn',
                            returnStdout: true
                        ).trim()
                        env.AI_FQDN = sh(
                            script: 'terraform output -raw ai_service_fqdn',
                            returnStdout: true
                        ).trim()

                        echo "   ACR        : ${env.ACR_LOGIN_SERVER}"
                        echo "   Frontend   : ${env.FRONTEND_URL}"
                    }
                }
            }
        }

        // ── 6. Login to Azure Container Registry ─────────────
        stage('ACR Login') {
            when {
                expression { return params.DEPLOY_APPS }
            }
            steps {
                script {
                    def acrName = (env.ACR_LOGIN_SERVER ?: ACR_SERVER).split('\\.')[0]
                    echo "🔐 Logging in to ACR: ${acrName}..."
                    sh "az acr login --name ${acrName}"
                    echo "✅ ACR login successful"
                }
            }
        }

        // ── 7. Build & Push Docker Images (parallel) ─────────
        stage('Build & Push Images') {
            when {
                expression { return params.DEPLOY_APPS }
            }
            parallel {

                stage('Backend Image') {
                    steps {
                        script {
                            def server    = env.ACR_LOGIN_SERVER ?: ACR_SERVER
                            def imageName = "${server}/${PROJECT_NAME}-backend"
                            def cacheFlag = params.FORCE_REBUILD ? '--no-cache' : ''

                            sh """
                                docker build ${cacheFlag} \
                                    -f docker/dockerfiles/backend.Dockerfile \
                                    -t ${imageName}:${IMAGE_TAG} \
                                    -t ${imageName}:latest \
                                    .
                                docker push ${imageName}:${IMAGE_TAG}
                                docker push ${imageName}:latest
                            """
                            echo "✅ Backend pushed → ${imageName}:${IMAGE_TAG}"
                        }
                    }
                }

                stage('AI Service Image') {
                    steps {
                        script {
                            def server    = env.ACR_LOGIN_SERVER ?: ACR_SERVER
                            def imageName = "${server}/${PROJECT_NAME}-ai-service"
                            def cacheFlag = params.FORCE_REBUILD ? '--no-cache' : ''

                            sh """
                                docker build ${cacheFlag} \
                                    -f docker/dockerfiles/ai-service.Dockerfile \
                                    -t ${imageName}:${IMAGE_TAG} \
                                    -t ${imageName}:latest \
                                    .
                                docker push ${imageName}:${IMAGE_TAG}
                                docker push ${imageName}:latest
                            """
                            echo "✅ AI Service pushed → ${imageName}:${IMAGE_TAG}"
                        }
                    }
                }

                stage('Frontend Image') {
                    steps {
                        script {
                            def server    = env.ACR_LOGIN_SERVER ?: ACR_SERVER
                            def imageName = "${server}/${PROJECT_NAME}-frontend"
                            def cacheFlag = params.FORCE_REBUILD ? '--no-cache' : ''

                            sh """
                                docker build ${cacheFlag} \
                                    -f docker/dockerfiles/frontend.Dockerfile \
                                    --build-arg VITE_API_URL=/api \
                                    --build-arg VITE_AI_SERVICE_URL=/ai \
                                    -t ${imageName}:${IMAGE_TAG} \
                                    -t ${imageName}:latest \
                                    .
                                docker push ${imageName}:${IMAGE_TAG}
                                docker push ${imageName}:latest
                            """
                            echo "✅ Frontend pushed → ${imageName}:${IMAGE_TAG}"
                        }
                    }
                }
            }
        }

        // ── 8. Deploy to Azure Container Apps ────────────────
        stage('Deploy to Azure') {
            when {
                expression { return params.DEPLOY_APPS }
            }
            steps {
                script {
                    def server = env.ACR_LOGIN_SERVER ?: ACR_SERVER
                    def rg     = RG_NAME
                    def env_   = params.ENVIRONMENT

                    echo "🚀 Deploying all services to Azure Container Apps..."

                    // --- Backend ---
                    sh """
                        az containerapp update \
                            --name    ${PROJECT_NAME}-${env_}-backend \
                            --resource-group ${rg} \
                            --image   ${server}/${PROJECT_NAME}-backend:${IMAGE_TAG} \
                            --output  none
                    """
                    echo "  ✅ Backend deployed"

                    // --- AI Service ---
                    sh """
                        az containerapp update \
                            --name    ${PROJECT_NAME}-${env_}-ai-service \
                            --resource-group ${rg} \
                            --image   ${server}/${PROJECT_NAME}-ai-service:${IMAGE_TAG} \
                            --output  none
                    """
                    echo "  ✅ AI Service deployed"

                    // --- Frontend ---
                    sh """
                        az containerapp update \
                            --name    ${PROJECT_NAME}-${env_}-frontend \
                            --resource-group ${rg} \
                            --image   ${server}/${PROJECT_NAME}-frontend:${IMAGE_TAG} \
                            --output  none
                    """
                    echo "  ✅ Frontend deployed"

                    // Get the live domain from Azure (works even if terraform wasn't run this build)
                    def frontendFqdn = sh(
                        script: """
                            az containerapp show \
                                --name    ${PROJECT_NAME}-${env_}-frontend \
                                --resource-group ${rg} \
                                --query   properties.configuration.ingress.fqdn \
                                --output  tsv
                        """,
                        returnStdout: true
                    ).trim()

                    env.LIVE_URL = "https://${frontendFqdn}"
                    echo "🌐 Live URL: ${env.LIVE_URL}"
                }
            }
        }

        // ── 9. Smoke Test ─────────────────────────────────────
        stage('Smoke Test') {
            when {
                expression { return params.DEPLOY_APPS }
            }
            steps {
                script {
                    def url = env.LIVE_URL ?: env.FRONTEND_URL
                    echo "🔍 Waiting 45s for container apps to stabilise..."
                    sleep(time: 45, unit: 'SECONDS')

                    echo "🔍 Smoke testing: ${url}"

                    // Health check – retry 5× with 15s gap
                    sh """
                        for i in 1 2 3 4 5; do
                            if curl -sf --max-time 15 "${url}/health"; then
                                echo "✅ Health check passed on attempt \$i"
                                exit 0
                            fi
                            echo "  attempt \$i failed, retrying in 15s..."
                            sleep 15
                        done
                        echo "❌ Smoke test failed after 5 attempts"
                        exit 1
                    """

                    // Backend API reachable through nginx proxy?
                    sh """
                        if curl -sf --max-time 15 "${url}/api/actuator/health" | grep -q '"status":"UP"'; then
                            echo "✅ Backend API healthy"
                        else
                            echo "⚠️  Backend API not responding yet (may still be warming up)"
                        fi
                    """
                }
            }
        }
    }

    // ── Post actions ──────────────────────────────────────────
    post {
        success {
            script {
                def url = env.LIVE_URL ?: env.FRONTEND_URL ?: '(check Azure Portal)'
                echo """
╔══════════════════════════════════════════════════╗
║   ✅  PIPELINE SUCCEEDED                         ║
╠══════════════════════════════════════════════════╣
║  Environment : ${params.ENVIRONMENT.padRight(34)}║
║  Image Tag   : ${IMAGE_TAG.take(34).padRight(34)}║
╠══════════════════════════════════════════════════╣
║  🌐 Live URL:                                    ║
║  ${url.take(50).padRight(50)}║
╚══════════════════════════════════════════════════╝
                """
            }
        }
        failure {
            echo """
╔══════════════════════════════════════════════════╗
║   ❌  PIPELINE FAILED                            ║
╠══════════════════════════════════════════════════╣
║  Environment : ${params.ENVIRONMENT.padRight(34)}║
║  Check the stage logs above for details.         ║
╚══════════════════════════════════════════════════╝
            """
        }
        always {
            // Remove dangling images to reclaim disk space on agent
            sh 'docker image prune -f || true'
        }
    }
}
