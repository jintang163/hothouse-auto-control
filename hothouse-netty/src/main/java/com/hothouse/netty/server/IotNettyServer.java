package com.hothouse.netty.server;

import com.hothouse.netty.codec.IotMessageDecoder;
import com.hothouse.netty.codec.IotMessageEncoder;
import com.hothouse.netty.handler.*;
import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.timeout.IdleStateHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class IotNettyServer {

    @Value("${netty.port:8888}")
    private int port;

    @Value("${netty.boss-threads:1}")
    private int bossThreads;

    @Value("${netty.worker-threads:8}")
    private int workerThreads;

    @Value("${netty.idle-timeout:120}")
    private int idleTimeout;

    private final DeviceConnectionHandler connectionHandler;
    private final DeviceAuthHandler authHandler;
    private final HeartbeatHandler heartbeatHandler;
    private final DataUploadHandler dataUploadHandler;
    private final ControlResponseHandler controlResponseHandler;

    private EventLoopGroup bossGroup;
    private EventLoopGroup workerGroup;
    private Channel serverChannel;

    @PostConstruct
    public void start() {
        bossGroup = new NioEventLoopGroup(bossThreads);
        workerGroup = new NioEventLoopGroup(workerThreads);

        try {
            ServerBootstrap bootstrap = new ServerBootstrap();
            bootstrap.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .option(ChannelOption.SO_BACKLOG, 1024)
                    .option(ChannelOption.SO_REUSEADDR, true)
                    .childOption(ChannelOption.SO_KEEPALIVE, true)
                    .childOption(ChannelOption.TCP_NODELAY, true)
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) throws Exception {
                            ChannelPipeline pipeline = ch.pipeline();

                            pipeline.addLast("idleStateHandler",
                                    new IdleStateHandler(idleTimeout, 0, 0, TimeUnit.SECONDS));
                            pipeline.addLast("decoder", new IotMessageDecoder());
                            pipeline.addLast("encoder", new IotMessageEncoder());
                            pipeline.addLast("connectionHandler", connectionHandler);
                            pipeline.addLast("authHandler", authHandler);
                            pipeline.addLast("heartbeatHandler", heartbeatHandler);
                            pipeline.addLast("dataUploadHandler", dataUploadHandler);
                            pipeline.addLast("controlResponseHandler", controlResponseHandler);
                        }
                    });

            ChannelFuture future = bootstrap.bind(port).sync();
            serverChannel = future.channel();

            log.info("Netty IoT server started on port: {}", port);

            new Thread(() -> {
                try {
                    serverChannel.closeFuture().sync();
                } catch (InterruptedException e) {
                    log.info("Netty server interrupted");
                    Thread.currentThread().interrupt();
                }
            }, "netty-server-listener").start();

        } catch (Exception e) {
            log.error("Start Netty server error", e);
            stop();
            throw new RuntimeException("Failed to start Netty server", e);
        }
    }

    @PreDestroy
    public void stop() {
        log.info("Stopping Netty IoT server...");

        if (serverChannel != null) {
            serverChannel.close();
        }

        if (workerGroup != null) {
            workerGroup.shutdownGracefully();
        }

        if (bossGroup != null) {
            bossGroup.shutdownGracefully();
        }

        log.info("Netty IoT server stopped");
    }

    public int getPort() {
        return port;
    }

    public boolean isRunning() {
        return serverChannel != null && serverChannel.isActive();
    }
}
