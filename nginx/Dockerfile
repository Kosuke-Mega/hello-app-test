FROM ubuntu:22.04

# 環境変数設定
ENV DEBIAN_FRONTEND=noninteractive

# タイムゾーン設定
RUN apt-get update && apt-get install -y tzdata
ENV TZ=Asia/Tokyo

# Nginxのインストール
RUN apt-get update && apt-get install -y nginx \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Nginxの設定ファイルをコピー
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# ポート設定
EXPOSE 80

# Nginxを起動
CMD ["nginx", "-g", "daemon off;"]