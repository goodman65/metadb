FROM harbor.dev.21vianet.com/taojun/centos:7.4.1708-debug
COPY cmdb /data/cmdb
ADD run.sh  /data
{{if .WebServer}}
#自动 解压缩
Add web.tar.gz  /data/cmdb
{{end}}

WORKDIR /data
CMD ["./run.sh"]
#RUN ./run.sh
