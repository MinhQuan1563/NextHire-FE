pipeline {
    agent any

    environment {
        FE_DIR = '/app/NextHire-FE' 
        COMPOSE_DIR = '/app/NextHire'
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main',
                credentialsId: 'github-nexthire-key',
                url: 'git@github.com:MinhQuan1563/NextHire-FE.git'
            }
        }

        stage('Update Code on Server') {
            steps {
                script {
                    sh 'cp -r ./* ${FE_DIR}/'
                }
            }
        }

        stage('Build & Deploy Frontend') {
            steps {
                dir("${env.COMPOSE_DIR}") {
                    script {
                        sh 'docker compose -p nexthire-v2 up -d --build --no-deps frontend'
                        sh 'docker image prune -f'
                    }
                }
            }
        }
    }
}