import subprocess
import json
import os


def main():
    print('1. setup lambda resource')
    subprocess.run(
        ['npm', 'install'],
        stdout=subprocess.PIPE,
        cwd='./lambda',
        check=True
    )
    #subprocess.run(
    #    ['npm', 'run', 'build'],
    #    stdout=subprocess.PIPE,
    #    cwd='./lambda',
    #    check=True
    #)

    lambda_path = './var/lambda_function'
    if not os.path.exists(lambda_path):
        os.mkdir(lambda_path)
        shutil.copyfile('./lambda/index.js', './var/lambda_function/index.js')
        shutil.copytree('./lambda/node_modules', './var/lambda_function/node_modules')

    #subprocess.run(
    #    ['zip', '-r', './var/lambda.zip', './var/lambda_function'],
    #    stdout=subprocess.PIPE,
    #    check=True
    #)

    print('2. destroy infra')
    region = os.environ.get('AWS_DEFAULT_REGION') or 'ap-northeast-1'
    backend_bucket = os.environ.get('TERRAFORM_BACKEND_BUCKET')\
                        or 'fggc-prod-terraform-state'
    backend_region = os.environ.get('TERRAFORM_BACKEND_REGION') or region

    terraform_init_cmd = ['terraform', 'init',
                          '-backend-config=bucket=%s' % backend_bucket,
                          '-backend-config=key=terraform.tfstate',
                          '-backend-config=region=%s' % backend_region]
    subprocess.run(terraform_init_cmd, cwd='./infra', check=True)

    terraform_destroy_cmd = ['terraform', 'destroy', '-auto-approve']

    if os.path.exists('terraform.tfvars'):
        terraform_destroy_cmd.append('-var-file=%s' % './terraform.tfvars')

    db_passwd = os.environ.get('DB_PASSWORD', '')
    if len(db_passwd) > 0:
        terraform_destroy_cmd.append('-var')
        terraform_destroy_cmd.append('aws_db_password=%s' % db_passwd)

    subprocess.run(terraform_destroy_cmd, cwd='./infra', check=True)


if __name__ == '__main__':
    main()
