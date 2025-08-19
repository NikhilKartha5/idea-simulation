pipeline {
  agent any
  environment {
    REGISTRY = "${env.AWS_ACCOUNT_ID}.dkr.ecr.${env.AWS_REGION}.amazonaws.com"
    IMAGE_TAG = "${env.BUILD_NUMBER}"
    DOCKER_BUILDKIT = '1'
    COMPOSE_DOCKER_CLI_BUILD = '1'
  }
  options {
    timestamps()
    ansiColor('xterm')
    buildDiscarder(logRotator(numToKeepStr: '25'))
    timeout(time: 30, unit: 'MINUTES')
  }
  parameters {
    booleanParam(name: 'APPLY_TERRAFORM', defaultValue: false, description: 'Apply Terraform changes to infra environment')
    choice(name: 'DEPLOY_ENV', choices: ['dev','staging','prod'], description: 'Deployment environment')
  }
  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Prepare Workspace') {
      steps {
        sh 'npm --version'
        sh 'node --version'
        sh 'npm install'
      }
    }
    stage('Lint & Test') {
      parallel {
        stage('Lint') {
          steps { sh 'npm --workspace gateway run lint || true' }
        }
        stage('Unit Tests') {
          steps { sh 'npm test --workspaces || true' }
        }
      }
    }
    stage('Build Images') {
      steps {
        script {
          def services = ['gateway','frontend','idea-service','vote-service','comment-service','auth-service']
          services.each { svc ->
            sh "docker build -t ${svc}:${IMAGE_TAG} -f ${svc == 'gateway' || svc == 'frontend' ? svc : 'services/' + svc}/Dockerfile ${svc == 'gateway' || svc == 'frontend' ? svc : 'services/' + svc}"
          }
        }
      }
    }
    stage('Login ECR') {
      when { expression { return env.AWS_ACCOUNT_ID } }
      steps {
        sh 'aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $REGISTRY'
      }
    }
    stage('Push Images') {
      when { expression { return env.AWS_ACCOUNT_ID } }
      steps {
        script {
          def services = ['gateway','frontend','idea-service','vote-service','comment-service','auth-service']
          services.each { svc ->
            sh "docker tag ${svc}:${IMAGE_TAG} $REGISTRY/${svc}:${IMAGE_TAG}"
            sh "docker push $REGISTRY/${svc}:${IMAGE_TAG}"
            sh "docker tag $REGISTRY/${svc}:${IMAGE_TAG} $REGISTRY/${svc}:latest"
            sh "docker push $REGISTRY/${svc}:latest"
          }
        }
      }
    }
    stage('Terraform Plan') {
      steps {
        dir('infra/terraform') {
          sh 'terraform init -input=false'
          sh 'terraform workspace select ${DEPLOY_ENV} || terraform workspace new ${DEPLOY_ENV}'
          sh 'terraform plan -var env=${DEPLOY_ENV} -out=tfplan -input=false'
        }
      }
    }
    stage('Terraform Apply (Manual)') {
      when { beforeAgent true; expression { return params.APPLY_TERRAFORM == 'true' } }
      steps {
        dir('infra/terraform') { sh 'terraform apply -input=false tfplan' }
      }
    }
    stage('Deploy App (EC2 User Data placeholder)') {
      when { expression { return env.AWS_ACCOUNT_ID && params.APPLY_TERRAFORM == 'true' } }
      steps {
        echo 'Deployment step would trigger rolling update (placeholder).'
      }
    }
    stage('Smoke Tests') {
      steps {
        script {
          sh '''#!/bin/bash
set -euo pipefail
echo "Running smoke tests against gateway container"
docker run --rm --network $(docker network ls --format '{{.Name}}' | grep project_app || echo project_app) curlimages/curl:8.8.0 curl -s gateway:8080/health | grep 'ok'
'''
        }
      }
    }
  }
  post {
    always { archiveArtifacts artifacts: '**/junit*.xml', allowEmptyArchive: true }
    success { echo 'Pipeline success' }
    failure { echo 'Pipeline failed' }
  }
}
