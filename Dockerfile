FROM debian:buster-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
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

RUN cd /root && git clone https://github.com/horchi/linux-p4d/ \
    && cd linux-p4d \
    && echo "73c73"                       > Make.patch \
    && echo -e "< \tmake install-systemd" >> Make.patch \
    && echo "---"                          >> Make.patch \
    && echo -e "> \t#make install-systemd">> Make.patch \
    && echo #### \
    && cat Make.patch \
    && echo ####\
    && patch -p1 Makefile <Make.patch \
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
    && rm -r /root/linux-p4d 


#ENTRYPOINT ["/usr/local/bin/p4d"]
#ENTRYPOINT ["/usr/bin/bash"]
CMD ping localhost



