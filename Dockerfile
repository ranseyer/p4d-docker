FROM debian:buster-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
        git wget              \
        apt-transport-https   \
        ca-certificates       \
        cmake                 \
        build-essential       \
        pkg-config            \
        libssl-dev            \
        libjansson-dev        \
        libxml2-dev           \
        libcurl4-openssl-dev  \
        libssl-dev            \
        libmariadbclient-dev  \
        libmariadb-dev-compat \
        uuid-dev              \
        msmtp-mta bsd-mailx   \
        locales               \
        bash iputils-ping     \
    && rm -rf /var/lib/apt/lists/* \
    && localedef -i de_DE -c -f UTF-8 -A /usr/share/locale/locale.alias de_DE.UTF-8
ENV LANG de_DE.UTF-8



#### Achtung: 
#de_DE.UTF-8 is required as language package (Raspberry command: dpkg-reconfigure locales
#RUN sed -i 's/^# *\(en_US.UTF-8\|de_DE.UTF-8\)/\1/' /etc/locale.gen && \
#    locale-gen
#ENV LANG de_DE.utf8

#Libwebsockets
RUN cd /root && git clone https://github.com/warmcat/libwebsockets && cd libwebsockets && mkdir build && cd build && cmake -DLWS_MAX_SMP=1 -DCMAKE_INSTALL_PREFIX:PATH=/usr -DCMAKE_C_FLAGS="-fpic" .. && make && make install && ldconfig && rm -r /root/libwebsockets


#P4D
ARG localUser=p4d
ARG workdir=/home/$localUser/repo

RUN git clone https://github.com/horchi/linux-p4d/ /root/linux-p4d/ \
    && cd /root/linux-p4d/ \
    && wget https://raw.githubusercontent.com/ranseyer/p4d-docker/main/Make.patch \
    && patch -p1 /root/linux-p4d/Makefile <Make.patch \
    && make clean all \
    && make install \
    && useradd --create-home --shell /bin/bash $localUser \
    && mkdir -p $workdir \
    && chown $localUser $workdir




RUN apt-get remove -y \
        git                   \
        apt-transport-https   \
        ca-certificates       \
        cmake                 \
        build-essential       \
        pkg-config            \
        libssl-dev            \
        libjansson-dev        \
        libxml2-dev           \
        libcurl4-openssl-dev  \
        libssl-dev            \
        libmariadbclient-dev  \
        libmariadb-dev-compat \
        uuid-dev              \
    && apt-get autoremove -y  \
    &&rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /usr/share/man/?? /usr/share/man/??_* \
    &&echo

##    && rm -r /root/linux-p4d 


#ENTRYPOINT ["/usr/local/bin/p4d"]
#ENTRYPOINT ["/usr/bin/bash"]
CMD ping localhost



