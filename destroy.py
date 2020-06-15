import subprocess
import json
import os


def main():
    region = os.environ.get('AWS_DEFAULT_REGION') or 'ap-northeast-1'
    backend_bucket = os.environ.get('TERRAFORM_BACKEND_BUCKET')\
                        or 'fggc-prod-terraform-state'
    backend_region = os.environ.get('TERRAFORM_BACKEND_REGION') or region

    print('1. deploy infra')
    terraform_init_cmd = ['terraform', 'init',
                          '-backend-config=bucket=%s' % backend_bucket,
                          '-backend-config=key=terraform.tfstat',
                          '-backend-config=region=%s' % backend_region]
    subprocess.run(terraform_init_cmd, cwd='./infra', check=True)

    terraform_apply_cmd = ['terraform', 'destroy', '-auto-approve']

    if os.path.exists('terraform.tfvars'):
        terraform_apply_cmd.append('-var-file=%s' % './terraform.tfvars')

    db_passwd = os.environ.get('DB_PASSWORD', '')
    if len(db_passwd) > 0:
        terraform_apply_cmd.append('-var')
        terraform_apply_cmd.append('aws_db_password=%s' % db_passwd)

    subprocess.run(terraform_apply_cmd, cwd='./infra', check=True)


if __name__ == '__main__':
    main()
