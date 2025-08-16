# Deployment Guide

## GitHub Actions CI/CD для AWS Lambda

### Структура workflow'ів

- `.github/workflows/deploy.yml` - Reusable workflow для деплою
- `.github/workflows/dev-deploy.yml` - Деплой на dev при push в main/develop
- `.github/workflows/prod-deploy.yml` - Деплой на prod при release або manual

### Налаштування AWS

#### 1. Створіть IAM роль для GitHub Actions

```bash
# Створіть trust policy
cat > github-actions-trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_USERNAME/YOUR_REPO_NAME:*"
        }
      }
    }
  ]
}
EOF

# Замініть ACCOUNT_ID та YOUR_GITHUB_USERNAME/YOUR_REPO_NAME
aws iam create-role \
  --role-name GitHubActionsRole \
  --assume-role-policy-document file://github-actions-trust-policy.json

# Прикріпіть необхідні політики
aws iam attach-role-policy \
  --role-name GitHubActionsRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess

aws iam attach-role-policy \
  --role-name GitHubActionsRole \
  --policy-arn arn:aws:iam::aws:policy/AWSLambdaFullAccess
```

#### 2. Створіть ECR репозиторій

```bash
aws ecr create-repository --repository-name clickone-shop-api --region eu-central-1
```

#### 3. Створіть Lambda функцію

```bash
# Створіть роль для Lambda
aws iam create-role \
  --role-name LambdaExecutionRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": { "Service": "lambda.amazonaws.com" },
        "Action": "sts:AssumeRole"
      }
    ]
  }'

aws iam attach-role-policy \
  --role-name LambdaExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# Створіть Lambda функцію (замініть ACCOUNT_ID та IMAGE_URI)
aws lambda create-function \
  --function-name oneshop-api-dev \
  --package-type Image \
  --code ImageUri=ACCOUNT_ID.dkr.ecr.eu-central-1.amazonaws.com/clickone-shop-api:latest \
  --role arn:aws:iam::ACCOUNT_ID:role/LambdaExecutionRole \
  --timeout 30 \
  --memory-size 1024 \
  --architectures arm64
```

#### 4. Створіть Function URL (опціонально)

```bash
aws lambda create-function-url-config \
  --function-name oneshop-api-dev \
  --auth-type NONE

# Отримайте URL
aws lambda get-function-url-config \
  --function-name oneshop-api-dev \
  --query FunctionUrl --output text
```

### Налаштування GitHub

#### Repository Secrets (Settings → Secrets and variables → Actions)

**Secrets:**
- `AWS_ROLE_ARN` - ARN ролі GitHubActionsRole
- `DATABASE_URL` - Neon PostgreSQL connection string

**Variables:**
- `AWS_REGION` - eu-central-1 (або ваш регіон)
- `ECR_REPO_NAME` - clickone-shop-api
- `LAMBDA_FUNCTION_NAME` - oneshop-api-dev

#### Environment налаштування

Створіть environments у Settings → Environments:

1. **development**
   - Без захисту, деплой автоматично
   
2. **production** 
   - З required reviewers
   - Змінні для прод бази даних

### Використання

#### Деплой на dev
- Push в `main` або `develop` → автоматичний деплой
- Або Manual dispatch в Actions

#### Деплой на prod
- Створіть GitHub Release → автоматичний деплой
- Або Manual dispatch з вказанням image_tag

### Моніторинг

Після деплою:
1. Перевірте CloudWatch Logs для Lambda
2. Тестуйте endpoints:
   - `https://FUNCTION_URL/docs`
   - `https://FUNCTION_URL/docs/ai`
   - `https://FUNCTION_URL/api`

### Troubleshooting

**Lambda timeout:**
- Переконайтесь, що використовується `dist/lambda.handler`
- Перевірте, що `src/lambda.ts` не викликає `app.listen()`

**Database connection:**
- Перевірте `DATABASE_URL` у Lambda environment variables
- Переконайтесь, що URL містить `sslmode=require`

**Build failures:**
- Перевірте, що `npm run build:lambda` працює локально
- Переконайтесь, що всі залежності в `package.json` 