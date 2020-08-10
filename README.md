# GratefulChat

GratefulChat is a Support Chat System for every site



## Installation

### 1. Firebase Setting

Get Firebase config files and upload to S3 bucket

You need register and sign in to [Firebase](https://firebase.google.com/), before below settings

#### Create FIrebase Project

* Set project name
* Set to use GoogleAnalytics, if you need

#### Add Web App

Choose icon for "Add Web App" 

![firebase_config_01](https://raw.githubusercontent.com/uzura8/expressbird/dev_gc/src/doc/assets/img/firebase_config_01.png)



Input app-nickname and push "Register app" button

![firebase_config_02](https://raw.githubusercontent.com/uzura8/expressbird/dev_gc/src/doc/assets/img/firebase_config_02.png)



After registered, push "Next" button

And press "Continue to  console" button, then you go back to the project top

#### Get app sdk config for client side

Press "1 app" label, and press the cog icon of registered Web App 

![firebase_config_03](https://raw.githubusercontent.com/uzura8/expressbird/dev_gc/src/doc/assets/img/firebase_config_03.png)

 ![firebase_config_04](https://raw.githubusercontent.com/uzura8/expressbird/dev_gc/src/doc/assets/img/firebase_config_04.png)



Scroll to "Firebase SDK snippet" section, and select "config" radio button 

![firebase_config_05](https://raw.githubusercontent.com/uzura8/expressbird/dev_gc/src/doc/assets/img/firebase_config_05.png)

Save config for json format like below with filename __"firebase-app-sdk-config.json"__

````json
{
  "apiKey": "******************",
  "authDomain": "sample-chat-system.firebaseapp.com",
  "databaseURL": "https://sample-chat-system.firebaseio.com",
  "projectId": "sample-chat-system",
  "storageBucket": "sample-chat-system.appspot.com",
  "messagingSenderId": "******************",
  "appId": "******************",
  "measurementId": "********"
}
````

#### Get credentials

Press "Service account" tab on "Settings" page, and press "Generate new private key" button

![firebase_config_06](https://raw.githubusercontent.com/uzura8/expressbird/dev_gc/src/doc/assets/img/firebase_config_06.jpg)



After downloaded, rename to __"firebase-admin-credentials.json__"

#### Authentication setting 

Open Authentication page.

![firebase_config_07](https://raw.githubusercontent.com/uzura8/expressbird/dev_gc/src/doc/assets/img/firebase_config_07.png)



Register "Email/Password" and "Anonymous" for "Sign-in providers"

![firebase_config_08](https://raw.githubusercontent.com/uzura8/expressbird/dev_gc/src/doc/assets/img/firebase_config_08.png)

![firebase_config_09](https://raw.githubusercontent.com/uzura8/expressbird/dev_gc/src/doc/assets/img/firebase_config_09.png)



#### Upload config files to S3 Bucket

Access to [S3 console on AWS](https://s3.console.aws.amazon.com/s3/home)

Create bucket name as __"grateful-chat-hoge"__, and save below

* /config/firebase-app-sdk-config.json
* /config/firebase-admin-credentials.json

### 2. Build and Push Docker Container to ECR by CodeBuild

#### 1) Create ECR Repository

Access to ECR console on AWS

Press button "Create repository"

Input below

* repository name: gc-fargate
* Press button "Create repository"

Copy URI named "gc-fargate" -> {{your-account-id}}.dkr.ecr.ap-northeast-1.amazonaws.com/gc-fargate

#### 2) Build and Push Docker Container by CodeBuild

Access to CodeBuild console on AWS

Press "Create build project" button

Input below

* Section "Project configuration"
    * Project name: cb-gc
* Section "Source"
    * Source provider: "GitHub"
    * Repository: "Repository in my GitHub account"
    * Repository URL: https://github.com/rysk92/grateful-chat-private
    * Source version: master
* Section "Environment"
    * Environment image: Managed image
    * Operating system: Ubuntu
    * Runtime(s): Standard
    * Image: aws/codebuild/standard:3.0
    * Image version: Always use the latest image for this runtime version
    * Environment type: Linux
    * Privileged: Checked
    * Service role: ※Write later
        * Select role "iam-role-cb-gc" created before 
    * Additional configuration
        * Environment variables
            * AWS_DEFAULT_REGION: ap-northeast-1
            * IMAGE_NAME: gc-fargate 
* Section "Buildspec"
    * Build specifications: Use a buildspec file

Press button "Create build project", then created buid project and moved to project top

Start build by press button "Start build", then complete

### 3. Setup infra

#### Execute terraform by CodeBuild

Access to CodeBuild console on AWS

Press "Create build project" button

Input below

* Section "Project configuration"
    * Project name: cb-gc-setup-infra
* Section "Source"
    * Sourceprovider: "GitHub"
    * Repository: "Repository in my GitHub account"
    * Repository URL: https://github.com/rysk92/grateful-chat-private
    * Source version: master
* Section "Environment"
    * Environment image: Managed image
    * Operating system: Ubuntu
    * Runtime(s): Standard
    * Image: aws/codebuild/standard:3.0
    * Image version: Always use the latest image for this runtime version
    * Environment type: Linux
    * Privileged: Checked
    * Service role: ※Write later
        * Create role named "iam-role-cb-gc"
        * Reffer
            * https://www.terraform.io/docs/providers/aws/index.html#ecs-and-codebuild-task-roles
            * https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html
    * Additional configuration > Environment variables
        * AWS_DEFAULT_REGION: ap-northeast-1
        * TERRAFORM_BACKEND_BUCKET: gc-terraform-state-hoge
        * DB_PASSWORD: password_hoge
        * SESSION_KEY: hoge
        * AWS_S3_BUCKET_NAME: grateful-chat-hoge
*  Section "Buildspec"
    * Build specifications: Use a buildspec file
    * Buildspec 名: buildspec_deploy_infra.yml

Press button "Create build project", then created buid project and moved to project top

Start build by press button "Start build", then complete

### 4. Setup database

#### Get AWS resouce informations

##### RDS endpoint

Access to RDS console, and chose "fggc-prod-rds-db"

Copy endpoint like "fggc-prod-rds-db.*********.ap-northeast-1.rds.amazonaws.com"

#### Execute setup db script by CodeBuild

Access to CodeBuild console on AWS

Press "Create build project" button

Input below

* Section "Project configuration"
    * Project name: cb-gc-setup-db
* Section "Source"
    * Sourceprovider: "GitHub"
    * Repository: "Repository in my GitHub account"
    * Repository URL: https://github.com/rysk92/grateful-chat-private
    * Source version: master
* Section "Environment"
    * Environment image: Managed image
    * Operating system: Ubuntu
    * Runtime(s): Standard
    * Image: aws/codebuild/standard:3.0
    * Image version: Always use the latest image for this runtime version
    * Environment type: Linux
    * Privileged: Checked
    * Service role: ※Write later
        * Select role "iam-role-cb-gc" created before 
    * Additional configuration
        * VPC: VPC built above
        * Subnets: fggc-prod-subnet-private_a
        * Security groups:  fggc-prod-sg-db
        * Press [Validate VPC Settings] button and confirm that "VPC is connected to the Internet" is displayed
        * Environment variables
            * AWS_DEFAULT_REGION: ap-northeast-1
            * DATABASE_URL: "mysql://db_admin:password_hoge@fggc-prod-rds-db.*********.ap-northeast-1.rds.amazonaws.com:3306/gc_db"
            * SESSION_KEY: hoge 
            * AWS_S3_BUCKET_NAME: grateful-chat-hoge
*  Section "Buildspec"
    * Build specifications: Use a buildspec file
    * Buildspec 名: buildspec_deploy_db.yml

Press button "Create build project", then created buid project and moved to project top

Start build by press button "Start build", then complete

### 5. Check enabled to access Greateful Chat

#### 1) Check DNS name of Load Balancer

Access to [Load Balancer console](https://ap-northeast-1.console.aws.amazon.com/ec2/v2/home?region=ap-northeast-1#LoadBalancers) , and copy DNA name

#### 2) Check on browser

Request DNS name on your browser, then you can access to Greateful Chat

#### 3) Admin user login 

Access to Sign In page, and sign in by Input admin@example.com / password_hoge

### 6. Set Chat Window on your web site

Set below script tag on your web site

````
<script type="text/javascript" src="http://load_blancer_dns_name/assets/js/chat_frame.js" id="gc-include-script"></script>
````



### Destroy infra, if you need

#### Delete Lex bot and intent manually

* Access to Lex console
* Delete bot named "GCSupportBot"
* Delete intent named "FirstSupport"

#### Execute terraform by CodeBuild

Access to CodeBuild console on AWS

Press "Create build project" button

Input below

* Section "Project configuration"
    * Project name: cb-gc-destroy-infra
* Section "Source"
    * Sourceprovider: "GitHub"
    * Repository: "Repository in my GitHub account"
    * Repository URL: https://github.com/rysk92/grateful-chat-private
    * Source version: master
* Section "Environment"
    * Environment image: Managed image
    * Operating system: Ubuntu
    * Runtime(s): Standard
    * Image: aws/codebuild/standard:3.0
    * Image version: Always use the latest image for this runtime version
    * Environment type: Linux
    * Privileged: Checked
    * Service role: ※Write later
        * Select role "iam-role-cb-gc" created before 
    * Additional configuration > Environment variables
        * AWS_DEFAULT_REGION: ap-northeast-1
        * TERRAFORM_BACKEND_BUCKET: gc-terraform-state-hoge
* Section "Buildspec"
    * Build specifications: Use a buildspec file
    * Buildspec 名: buildspec_destroy_infra.yml

Press button "Create build project", then created buid project and moved to project top

Start build by press button "Start build", then complete