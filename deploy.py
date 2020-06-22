import subprocess
import json
import os
import shutil


def main():
    print('1. setup lambda resource')
    subprocess.run(
        ['npm', 'install'],
        stdout=subprocess.PIPE,
        cwd='./lambda',
        check=True
    )
    subprocess.run(
        ['npm', 'run', 'build'],
        stdout=subprocess.PIPE,
        cwd='./lambda',
        check=True
    )
    os.mkdir('./var/lambda_function')
    shutil.copyfile('./lambda/index.js', './var/lambda_function/index.js')
    shutil.copytree('./lambda/node_modules', './var/lambda_function/node_modules')

    print('2. deploy infra')
    region = os.environ.get('AWS_DEFAULT_REGION') or 'ap-northeast-1'
    backend_bucket = os.environ.get('TERRAFORM_BACKEND_BUCKET')\
                        or 'fggc-prod-terraform-state'
    backend_region = os.environ.get('TERRAFORM_BACKEND_REGION') or region

    terraform_init_cmd = ['terraform', 'init',
                          '-backend-config=bucket=%s' % backend_bucket,
                          '-backend-config=key=terraform.tfstate',
                          '-backend-config=region=%s' % backend_region]
    subprocess.run(terraform_init_cmd, cwd='./infra', check=True)

    terraform_apply_cmd = ['terraform', 'apply', '-auto-approve']

    if os.path.exists('terraform.tfvars'):
        terraform_apply_cmd.append('-var-file=%s' % './terraform.tfvars')

    db_passwd = os.environ.get('DB_PASSWORD', '')
    if len(db_passwd) > 0:
        terraform_apply_cmd.append('-var')
        terraform_apply_cmd.append('aws_db_password=%s' % db_passwd)

    subprocess.run(terraform_apply_cmd, cwd='./infra', check=True)
    state = subprocess.run(
        ['terraform', 'show', '-json'],
        stdout=subprocess.PIPE,
        cwd='./infra',
        check=True
    )
    resources = json.loads(state.stdout.decode('utf8'))['values']['root_module']['child_modules']
    db_host = [x for x in resources if x['address'] == 'module.module_rds'][0]['resources'][0]['values']['address']


if __name__ == '__main__':
    main()
