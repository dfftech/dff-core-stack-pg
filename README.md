### env example

```sh
export BASE_NAME=CORE
export CORE_DB_URL='postgresql://postgres:postgres@localhost:5432/public'
export CORE_LOG_MASK_KEYS='email,mobile,tel_code,telCode,phone,password,token,authorization,pic,secret'
echo $CORE_DB_URL
```

### health curl

```sh
# :id is the tenant (works for single- and multi-tenant)
curl -s http://localhost:4000/health/YOUR_TENANT_ID
```
