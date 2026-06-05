package com.hothouse.admin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@ComponentScan(basePackages = "com.hothouse")
@EnableScheduling
public class HothouseAdminApplication {

    public static void main(String[] args) {
        SpringApplication.run(HothouseAdminApplication.class, args);
        System.out.println("""
            =========================================================
              温室大棚智能环控系统 - 管理端启动成功
              API文档: http://localhost:8080/swagger-ui.html
              Netty端口: 8888
            =========================================================
            """);
    }
}
