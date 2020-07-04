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

####Authentication setting 

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

### 2. Setup infra

#### Execute terraform by CodeBuild

Access to CodeBuild console on AWS

Press "ビルドプロジェクトを作成する" button

Input below

* Section "プロジェクトの設定"
    * プロジェクト名: cb-gc-setup-infra
* Section "ソース"
    * ソースプロバイダ: "GitHub"
    * リポジトリ: "GitHub アカウントのリポジトリ"
    * GitHubアカウントのリポジトリ: https://github.com/rysk92/grateful-chat-private
    * ソースバージョン: master
* Section "環境"
    * 環境イメージ: マネージド型イメージ
    * オペレーティングシステム: Ubuntu
    * ランタイム: Standard
    * イメージ: aws/codebuild/standard:2.0
    * イメージのバージョン: 常に最新
    * 環境タイプ: Linux
    * 特権付与: Checked
    * サービスロール: ※あとでまとめる
        * Create role named "iam-role-cb-gc"
        * Reffer
            * https://www.terraform.io/docs/providers/aws/index.html#ecs-and-codebuild-task-roles
            * https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html
    * 追加設定 > 環境変数
        * AWS_DEFAULT_REGION: ap-northeast-1
        * DB_PASSWORD: password_hoge
        * TERRAFORM_BACKEND_BUCKET: gc-terraform-state-hoge
*  Section "Buildspec"
    * ビルド仕様: buildspec ファイルを使用する
    * Buildspec 名: buildspec_deploy_infra.yml

Press button "ビルドプロジェクトを作成する", then created buid project and moved to project top

Start build by press button "ビルドの開始", then complete

### 3. Setup database

#### Get AWS resouce informations

##### 1) RDS endpoint

Access to RDS console, and chose "fggc-prod-rds-db"

Copy endpoint like "fggc-prod-rds-db.*********.ap-northeast-1.rds.amazonaws.com"

##### 2) VPC

Access to VPC console

Confirm VPC ID named "fggc-prod-vpc"

#### Execute setup db script by CodeBuild

Access to CodeBuild console on AWS

Press "ビルドプロジェクトを作成する" button

Input below

* Section "プロジェクトの設定"
    * プロジェクト名: cb-gc-setup-db
* Section "ソース"
    * ソースプロバイダ: "GitHub"
    * リポジトリ: "GitHub アカウントのリポジトリ"
    * GitHubアカウントのリポジトリ: https://github.com/rysk92/grateful-chat-private
    * ソースバージョン: master
* Section "環境"
    * 環境イメージ: マネージド型イメージ
    * オペレーティングシステム: Ubuntu
    * ランタイム: Standard
    * イメージ: aws/codebuild/standard:2.0
    * イメージのバージョン: 常に最新
    * 環境タイプ: Linux
    * 特権付与: Checked
    * サービスロール: ※あとでまとめる
        * Select role "iam-role-cb-gc" created before 
    * 追加設定
        * VPC: ↑で作ったVPC
        * サブネット: fggc-prod-subnet-private_a
        * セキュリティグループ:  fggc-prod-sg-db
        * [VPC 設定の確認]を押して、「 VPC はインターネットに接続されています」が表示されることを確認
        * 環境変数
            * AWS_DEFAULT_REGION: ap-northeast-1
            * DATABASE_URL: "mysql://db_admin:password_hoge@fggc-prod-rds-db.*********.ap-northeast-1.rds.amazonaws.com:3306/gc_db"
            * SESSION_KEY: ほげ 
            * AWS_S3_BUCKET_NAME: grateful-chat-hoge
*  Section "Buildspec"
    * ビルド仕様: buildspec ファイルを使用する
    * Buildspec 名: buildspec_deploy_db.yml

Press button "ビルドプロジェクトを作成する", then created buid project and moved to project top

Start build by press button "ビルドの開始", then complete

### 4. Build and Push Docker Container to ECR by CodeBuild

#### 1) Create ECR Repository

Access to ECR console on AWS

Press button "リポジトリを作成"

Input below

* リポジトリ名: gc-fargate
* Press button "リポジトリを作成"

Copy URI named "gc-fargate" -> {{your-account-id}}.dkr.ecr.ap-northeast-1.amazonaws.com/gc-fargate

#### 2) Build and Push Docker Container by CodeBuild

Access to CodeBuild console on AWS

Press "ビルドプロジェクトを作成する" button

Input below

* Section "プロジェクトの設定"
    * プロジェクト名: cb-gc
* Section "ソース"
    * ソースプロバイダ: "GitHub"
    * リポジトリ: "GitHub アカウントのリポジトリ"
    * GitHubアカウントのリポジトリ: https://github.com/rysk92/grateful-chat-private
    * ソースバージョン: master
* Section "環境"
    * 環境イメージ: マネージド型イメージ
    * オペレーティングシステム: Ubuntu
    * ランタイム: Standard
    * イメージ: aws/codebuild/standard:2.0
    * イメージのバージョン: 常に最新
    * 環境タイプ: Linux
    * 特権付与: Checked
    * サービスロール: ※あとでまとめる
        * Select role "iam-role-cb-gc" created before 
    * 追加設定
        * 環境変数
            * AWS_DEFAULT_REGION: ap-northeast-1
            * IMAGE_NAME: gc-fargate 
* Section "Buildspec"
    * ビルド仕様: buildspec ファイルを使用する

Press button "ビルドプロジェクトを作成する", then created buid project and moved to project top

Start build by press button "ビルドの開始", then complete

### 5. Setup ECS/Fargate

#### 1) Create Task Definition

Access to ECS console on AWS

Move to "タスク定義" by link on left side menu

Press button "新しいタスク定義の作成"

Input below

* 起動タイプの互換性の選択: Fargate
* タスク定義名: gc-fargate
* タスク実行ロール: ※あとでまとめる
* タスクメモリ: 0.5GB
* タスク CPU: 0.25 vCPU
* Press button "コンテナの追加"
    * コンテナ名: gc-fargate
    * イメージ: {{your-account-id}}.dkr.ecr.ap-northeast-1.amazonaws.com/gc-fargate
        * This value copied before
    * ポートマッピング: 80 | TCP
    * 環境変数:
        * AWS_ACCESS_KEY_ID: ほげ
        * AWS_SECRET_ACCESS_KEY: ほげ
        * AWS_DEFAULT_REGION: ap-northeast-1
        * DATABASE_URL: "mysql://db_admin:password_hoge@fggc-prod-rds-db.*********.ap-northeast-1.rds.amazonaws.com:3306/gc_db"
        * SESSION_KEY: ほげ 
    * Press button "更新"
* Press button "作成"

#### 2) Create Cluster

Access to ECS console on AWS

Move to "クラスター" by link on left side menu

Press button "クラスターの作成"

Input below

* クラスターテンプレートの選択: ネットワーキングのみ(AWS Fargate を使用)
* クラスター名: cl-gc

Press button "作成"

#### 3) Create Service

Press tab "サービス"

Press button "作成"

Input below

* サービスの設定
    * 起動タイプ: Fargate
    * タスク定義: gc-fargate
    * サービス名: srv-gc-fargate
    * タスクの数: 1
* デプロイメント
    * デプロイメントタイプ: ローリングアップデート
* ネットワーク構成
    * クラスター VPC: VPC: ↑で作ったVPC
    * サブネット: 
        * fggc-prod-subnet-public_web_a
        * fggc-prod-subnet-public_web_b
    * セキュリティグループ: 
        * Accept HTTP | TCP | 80
* ロードバランシング
    * ロードバランサーの種類: Application Load Balancer
    * あとで書く

Press button "作成"

### Destroy infra, if you need

#### Execute terraform by CodeBuild

Access to CodeBuild console on AWS

Press "ビルドプロジェクトを作成する" button

Input below

* Section "プロジェクトの設定"
    * プロジェクト名: cb-gc-destroy-infra
* Section "ソース"
    * ソースプロバイダ: "GitHub"
    * リポジトリ: "GitHub アカウントのリポジトリ"
    * GitHubアカウントのリポジトリ: https://github.com/rysk92/grateful-chat-private
    * ソースバージョン: master
* Section "環境"
    * 環境イメージ: マネージド型イメージ
    * オペレーティングシステム: Ubuntu
    * ランタイム: Standard
    * イメージ: aws/codebuild/standard:2.0
    * イメージのバージョン: 常に最新
    * 環境タイプ: Linux
    * 特権付与: Checked
    * サービスロール: ※あとでまとめる
        * Select role "iam-role-cb-gc" created before 
    * 追加設定 > 環境変数
        * AWS_DEFAULT_REGION: ap-northeast-1
        * DB_PASSWORD: password_hoge
        * TERRAFORM_BACKEND_BUCKET: gc-terraform-state-hoge
* Section "Buildspec"
    * ビルド仕様: buildspec ファイルを使用する
    * Buildspec 名: buildspec_destroy_infra.yml

Press button "ビルドプロジェクトを作成する", then created buid project and moved to project top

Start build by press button "ビルドの開始", then complete

#### Delete Lex intent "FirstSupport" manually

Access to Lex console, and delete intent named "FirstSupport" manually

