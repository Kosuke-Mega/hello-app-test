FROM ubuntu:22.04

# 環境変数設定
ENV DEBIAN_FRONTEND=noninteractive

# タイムゾーン設定
RUN apt-get update && apt-get install -y tzdata
ENV TZ=Asia/Tokyo

# 必要なパッケージのインストール
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Node.jsのインストール
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm

# 作業ディレクトリの設定
WORKDIR /app

# Next.jsプロジェクトの初期化（新規プロジェクトの場合）
# コメントを外して使用するか、既存プロジェクトをマウントする場合はコメントアウトしたままにします
# RUN npx create-next-app@latest . --use-npm --typescript --eslint --tailwind --app --src-dir

# パッケージのインストール（package.jsonがある場合）
COPY package*.json ./
RUN npm install

# アプリケーションのコピー
COPY . .

# ビルド（本番環境用）
# RUN npm run build

# 開発サーバー起動
EXPOSE 3000
CMD ["npm", "run", "dev"]