#!/bin/sh

rm serialization.tar.gz || true
tar czvf serialization.tar.gz pom.xml instructions.txt data/ src/
