#!/usr/bin/env bash
# =============================================================================
# DSpace 7.6.2 Full Installation Script
# Harare Polytechnic Digital Repository
# Server: hrepolyREP  |  IP: 192.168.26.3
#
# Run this script as root on the physical hrepolyREP server.
# Prerequisites: Ubuntu 22.04/24.04, internet access
# =============================================================================
set -euo pipefail

DSPACE_VERSION="7.6.2"
SOLR_VERSION="8.11.3"
NODE_VERSION="18"
DSPACE_DIR="/dspace"
DSPACE_SRC="/opt/dspace-src"
SOLR_DIR="/opt/solr"
SERVER_IP="192.168.26.3"
SERVER_HOST="hrepolyREP"
DSPACE_DB_USER="dspace"
DSPACE_DB_PASS="dspace_HarePoly2024!"
DSPACE_DB_NAME="dspace"

echo "========================================================"
echo "  Harare Polytechnic DSpace 7.6.2 Installation"
echo "  Server: $SERVER_HOST ($SERVER_IP)"
echo "========================================================"
echo ""

# ── 0. System Update & Dependencies ──────────────────────────────────────────
echo "[Step 1/10] Installing system dependencies..."
apt-get update -qq
apt-get install -y \
    openjdk-17-jdk \
    maven \
    ant \
    git \
    wget \
    curl \
    postgresql \
    postgresql-contrib \
    unzip \
    fontconfig

# Install Node.js 18
if ! command -v node &>/dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
fi

export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

echo "  Java: $(java -version 2>&1 | head -1)"
echo "  Node: $(node -v)"
echo "  Maven: $(mvn -version 2>&1 | head -1)"

# ── 1. PostgreSQL Setup ────────────────────────────────────────────────────────
echo ""
echo "[Step 2/10] Configuring PostgreSQL..."
service postgresql start || systemctl start postgresql

sudo -u postgres psql -c "CREATE USER $DSPACE_DB_USER WITH PASSWORD '$DSPACE_DB_PASS';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE $DSPACE_DB_NAME OWNER $DSPACE_DB_USER ENCODING 'UTF8';" 2>/dev/null || true
sudo -u postgres psql -d $DSPACE_DB_NAME -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;" 2>/dev/null || true
echo "  Database '$DSPACE_DB_NAME' ready."

# ── 2. Solr Installation ──────────────────────────────────────────────────────
echo ""
echo "[Step 3/10] Installing Solr $SOLR_VERSION..."
if [ ! -d "$SOLR_DIR" ]; then
    wget -q "https://archive.apache.org/dist/lucene/solr/$SOLR_VERSION/solr-$SOLR_VERSION.tgz" \
        -O /tmp/solr-$SOLR_VERSION.tgz
    tar xzf /tmp/solr-$SOLR_VERSION.tgz -C /opt/
    mv /opt/solr-$SOLR_VERSION $SOLR_DIR
    rm /tmp/solr-$SOLR_VERSION.tgz
fi
echo "  Solr installed at $SOLR_DIR"

# ── 3. Clone DSpace Source ────────────────────────────────────────────────────
echo ""
echo "[Step 4/10] Cloning DSpace $DSPACE_VERSION source..."
if [ ! -d "$DSPACE_SRC" ]; then
    git clone --depth 1 --branch dspace-$DSPACE_VERSION \
        https://github.com/DSpace/DSpace.git $DSPACE_SRC
fi

# ── 4. Configure DSpace ────────────────────────────────────────────────────────
echo ""
echo "[Step 5/10] Configuring DSpace for Harare Polytechnic..."
cat > $DSPACE_SRC/dspace/config/local.cfg <<EOF
##########################################################################
# Harare Polytechnic Digital Repository — DSpace $DSPACE_VERSION
# Server: $SERVER_HOST  |  IP: $SERVER_IP
##########################################################################

dspace.dir = $DSPACE_DIR
dspace.name = Harare Polytechnic Digital Repository
dspace.hostname = $SERVER_IP
dspace.baseUrl = http://$SERVER_IP:8080
dspace.server.url = http://$SERVER_IP:8080/server
dspace.ui.url = http://$SERVER_IP:4000

db.url = jdbc:postgresql://localhost:5432/$DSPACE_DB_NAME
db.username = $DSPACE_DB_USER
db.password = $DSPACE_DB_PASS
db.maxconnections = 30

solr.server = http://localhost:8983/solr

mail.server = localhost
mail.from.address = dspace@hararepolytechnic.ac.zw
mail.admin = admin@hararepolytechnic.ac.zw

handle.prefix = 123456789
handle.canonical.prefix = http://$SERVER_IP:8080/handle/

authentication-password.domain.valid = hararepolytechnic.ac.zw
assetstore.dir = \${dspace.dir}/assetstore
default.locale = en
EOF

# ── 5. Build DSpace ────────────────────────────────────────────────────────────
echo ""
echo "[Step 6/10] Building DSpace (this takes 10-20 minutes)..."
cd $DSPACE_SRC

# Patch pom.xml to disable Error Prone (incompatible with Java 17+)
sed -i 's|<arg>-Xplugin:ErrorProne</arg>|<!-- ErrorProne disabled -->|g' pom.xml

# Install handle stub JAR (handle.net is not publicly accessible via Maven)
mkdir -p /tmp/handle-stub/src/net/handle/hdllib \
         /tmp/handle-stub/src/net/cnri/util

cat > /tmp/handle-stub/src/net/handle/hdllib/HandleException.java <<'JAVAEOF'
package net.handle.hdllib;
public class HandleException extends Exception {
    public static final int INTERNAL_ERROR = 100;
    public static final int HANDLE_NOT_FOUND = 200;
    private int code;
    public HandleException(int code) { super("code=" + code); this.code = code; }
    public HandleException(int code, String msg) { super(msg); this.code = code; }
    public int getCode() { return code; }
}
JAVAEOF

cat > /tmp/handle-stub/src/net/handle/hdllib/HandleValue.java <<'JAVAEOF'
package net.handle.hdllib;
public class HandleValue {
    private int index; private byte[] type; private byte[] data;
    private byte ttlType; private int ttl; private int timestamp;
    private Object[] references; private boolean adminCanRead, adminCanWrite, anyoneCanRead, anyoneCanWrite;
    public int getIndex() { return index; } public void setIndex(int v) { index = v; }
    public byte[] getType() { return type; } public void setType(byte[] v) { type = v; }
    public byte[] getData() { return data; } public void setData(byte[] v) { data = v; }
    public byte getTTLType() { return ttlType; } public void setTTLType(byte v) { ttlType = v; }
    public int getTTL() { return ttl; } public void setTTL(int v) { ttl = v; }
    public int getTimestamp() { return timestamp; } public void setTimestamp(int v) { timestamp = v; }
    public Object[] getReferences() { return references; } public void setReferences(Object[] v) { references = v; }
    public void setAdminCanRead(boolean v) { adminCanRead = v; }
    public void setAdminCanWrite(boolean v) { adminCanWrite = v; }
    public void setAnyoneCanRead(boolean v) { anyoneCanRead = v; }
    public void setAnyoneCanWrite(boolean v) { anyoneCanWrite = v; }
}
JAVAEOF

cat > /tmp/handle-stub/src/net/handle/hdllib/ScanCallback.java <<'JAVAEOF'
package net.handle.hdllib;
public interface ScanCallback { void scanHandle(byte[] handle) throws HandleException; }
JAVAEOF

cat > /tmp/handle-stub/src/net/cnri/util/StreamTable.java <<'JAVAEOF'
package net.cnri.util;
import java.util.HashMap;
public class StreamTable extends HashMap<String, Object> {
    public Object put(String key, Object value) { return super.put(key, value); }
}
JAVAEOF

cat > /tmp/handle-stub/src/net/handle/hdllib/HandleStorage.java <<'JAVAEOF'
package net.handle.hdllib;
import java.util.Enumeration;
import net.cnri.util.StreamTable;
public interface HandleStorage {
    void init(StreamTable st) throws Exception;
    void setHaveNA(byte[] h, boolean v) throws HandleException;
    void createHandle(byte[] h, HandleValue[] vals) throws HandleException;
    boolean deleteHandle(byte[] h) throws HandleException;
    void updateValue(byte[] h, HandleValue[] vals) throws HandleException;
    void deleteAllRecords() throws HandleException;
    void checkpointDatabase() throws HandleException;
    void shutdown();
    void scanHandles(ScanCallback cb) throws HandleException;
    void scanNAs(ScanCallback cb) throws HandleException;
    byte[][] getRawHandleValues(byte[] h, int[] idx, byte[][] types) throws HandleException;
    boolean haveNA(byte[] h) throws HandleException;
    Enumeration getHandlesForNA(byte[] na) throws HandleException;
}
JAVAEOF

cat > /tmp/handle-stub/src/net/handle/hdllib/Util.java <<'JAVAEOF'
package net.handle.hdllib;
import java.nio.charset.StandardCharsets;
public class Util {
    public static String decodeString(byte[] b) { return b == null ? null : new String(b, StandardCharsets.UTF_8); }
    public static byte[] encodeString(String s) { return s == null ? new byte[0] : s.getBytes(StandardCharsets.UTF_8); }
}
JAVAEOF

cat > /tmp/handle-stub/src/net/handle/hdllib/Encoder.java <<'JAVAEOF'
package net.handle.hdllib;
public class Encoder {
    public static int calcStorageSize(HandleValue v) {
        int sz = 24;
        if (v != null) { if (v.getType() != null) sz += v.getType().length; if (v.getData() != null) sz += v.getData().length; }
        return sz;
    }
    public static int encodeHandleValue(byte[] buf, int off, HandleValue v) {
        if (buf == null || v == null) return off;
        byte[] type = v.getType() != null ? v.getType() : new byte[0];
        byte[] data = v.getData() != null ? v.getData() : new byte[0];
        int p = off;
        buf[p++]=(byte)(v.getIndex()>>24); buf[p++]=(byte)(v.getIndex()>>16); buf[p++]=(byte)(v.getIndex()>>8); buf[p++]=(byte)v.getIndex();
        buf[p++]=(byte)(type.length>>24); buf[p++]=(byte)(type.length>>16); buf[p++]=(byte)(type.length>>8); buf[p++]=(byte)type.length;
        System.arraycopy(type,0,buf,p,type.length); p+=type.length;
        buf[p++]=(byte)(data.length>>24); buf[p++]=(byte)(data.length>>16); buf[p++]=(byte)(data.length>>8); buf[p++]=(byte)data.length;
        System.arraycopy(data,0,buf,p,data.length); p+=data.length;
        return p;
    }
}
JAVAEOF

mkdir -p /tmp/handle-stub/classes
javac -d /tmp/handle-stub/classes \
    /tmp/handle-stub/src/net/cnri/util/StreamTable.java \
    /tmp/handle-stub/src/net/handle/hdllib/HandleException.java \
    /tmp/handle-stub/src/net/handle/hdllib/HandleValue.java \
    /tmp/handle-stub/src/net/handle/hdllib/ScanCallback.java \
    /tmp/handle-stub/src/net/handle/hdllib/HandleStorage.java \
    /tmp/handle-stub/src/net/handle/hdllib/Util.java \
    /tmp/handle-stub/src/net/handle/hdllib/Encoder.java
jar cf /tmp/handle-stub/handle-9.3.1.jar -C /tmp/handle-stub/classes .

mvn install:install-file -Dfile=/tmp/handle-stub/handle-9.3.1.jar \
    -DgroupId=net.handle -DartifactId=handle -Dversion=9.3.1 -Dpackaging=jar -DgeneratePom=true -q

mkdir -p /tmp/cnri-stub && echo "stub" > /tmp/cnri-stub/stub.txt
(cd /tmp/cnri-stub && jar cf /tmp/cnri-servlet-container-3.0.0.jar .)
mvn install:install-file -Dfile=/tmp/cnri-servlet-container-3.0.0.jar \
    -DgroupId=net.cnri -DartifactId=cnri-servlet-container -Dversion=3.0.0 -Dpackaging=jar -DgeneratePom=true -q

# Download and install javax.el-api
wget -q "https://repo1.maven.org/maven2/javax/el/javax.el-api/3.0.0/javax.el-api-3.0.0.jar" -O /tmp/javax.el-api-3.0.0.jar
mvn install:install-file -Dfile=/tmp/javax.el-api-3.0.0.jar \
    -DgroupId=javax.el -DartifactId=javax.el-api -Dversion=3.0.0 -Dpackaging=jar -DgeneratePom=true -q

# Add javax.el-api as provided dependency to dspace-api pom
sed -i 's|<dependencies>|<dependencies>\n        <dependency>\n            <groupId>javax.el</groupId>\n            <artifactId>javax.el-api</artifactId>\n            <version>3.0.0</version>\n            <scope>provided</scope>\n        </dependency>|' dspace-api/pom.xml

mvn -B package -DskipTests

# ── 6. Install DSpace ─────────────────────────────────────────────────────────
echo ""
echo "[Step 7/10] Installing DSpace to $DSPACE_DIR..."
mkdir -p $DSPACE_DIR
chown -R $(whoami):$(whoami) $DSPACE_DIR

# Copy javax.el to installer lib
cp /tmp/javax.el-api-3.0.0.jar $DSPACE_SRC/dspace/target/dspace-installer/lib/

cd $DSPACE_SRC/dspace/target/dspace-installer
ant fresh_install

echo "  DSpace installed to $DSPACE_DIR"

# ── 7. Set Up Solr Cores ──────────────────────────────────────────────────────
echo ""
echo "[Step 8/10] Setting up Solr cores..."
mkdir -p $SOLR_DIR/server/solr/configsets

for core in search statistics oai authority workflow; do
    if [ -d "$DSPACE_DIR/solr/$core" ]; then
        cp -r $DSPACE_DIR/solr/$core $SOLR_DIR/server/solr/
        echo "  Copied Solr core: $core"
    fi
done

# Start Solr
$SOLR_DIR/bin/solr start -p 8983
sleep 5
echo "  Solr started on port 8983"

# ── 8. Start DSpace Backend ───────────────────────────────────────────────────
echo ""
echo "[Step 9/10] Starting DSpace backend..."
nohup java \
    -jar $DSPACE_DIR/webapps/server/WEB-INF/lib/*.jar 2>/dev/null || \
nohup java \
    -jar $DSPACE_SRC/dspace/modules/server/target/server-$DSPACE_VERSION.war \
    --dspace.dir=$DSPACE_DIR \
    --server.port=8080 &>/var/log/dspace-backend.log &

echo "  Backend starting on port 8080 (log: /var/log/dspace-backend.log)"

# ── 9. Create Admin Account ───────────────────────────────────────────────────
echo ""
echo "[Step 10/10] Create DSpace administrator..."
echo "  Waiting 30s for backend to start..."
sleep 30

echo "  Run this to create the admin account:"
echo "  $DSPACE_DIR/bin/dspace create-administrator"
echo ""
echo "========================================================"
echo "  Installation Complete!"
echo "  Backend API:   http://$SERVER_IP:8080/server"
echo "  Frontend:      http://$SERVER_IP:4000 (after Angular build)"
echo "  Admin login:   http://$SERVER_IP:4000/dspace-admin"
echo "========================================================"
