### env example

```sh
export BASE_NAME=CORE
export CORE_DB_URL='postgresql://postgres:postgres@localhost:5432/public'
export CORE_LOG_MASK_KEYS='email,mobile,tel_code,telCode,phone,password,token,authorization,pic,secret'
echo $CORE_DB_URL
# SMTP / S3: fill app_settings rows integration_smtp, integration_s3_public, integration_s3_private
# Optional fallback if those username/password fields are empty:
# export CORE_MAIL_SERVICE=outlook
# export CORE_MAIL_USER='noreply@example.com'
# export CORE_MAIL_PASS='...'
```

### health curl

```sh
# :id is the tenant (works for single- and multi-tenant)
curl -s http://localhost:4000/health/YOUR_TENANT_ID
```
