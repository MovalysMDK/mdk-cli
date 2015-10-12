* mdk-cli



* Dev interne
./mdk config-set snapshotEnable true
./mdk config-set mdkRepoRelease http://pdtinteg.ptx.fr.sopra/artifactory/prj-mdk-releases
./mdk config-set mdkRepoPluginRelease http://pdtinteg.ptx.fr.sopra/artifactory/prj-mdk-releases
./mdk config-set mdkRepoSnapshots http://pdtinteg.ptx.fr.sopra/artifactory/prj-mdk-snapshots
./mdk config-set mdkRepoPluginSnapshots http://pdtinteg.ptx.fr.sopra/artifactory/prj-mdk-snapshots
./mdk config-set mdkRepoGemsRelease http://pdtinteg.ptx.fr.sopra/artifactory/prj-mdkgems-releases/gems
./mdk config-set mdkRepoGit gitmovalys@git.ptx.fr.sopra:
./mdk config-set mdk_login mdk_ro
./mdk config-set mdk_password xM1t29DF

#./mdk config-set mdkUrl TODO
#./mdk config-set mdkRepoGemsRelease TODO
#./mdk config-set mdkRepoGit TODO

* Tests sur l'intégration continue

1) Création du zip

Supprimer le répertoire node_modules de mdk-cli
Faire un zip de mdk-cli

2) Transfert du zip

scp mdk-cli.zip gestionnaire@nansrvintc2.ntes.fr.sopra:/tmp

3) Installation

ssh gestionnaire@nansrvintc2.ntes.fr.sopra
chmod 777 /tmp/mdk-cli.zip
su - testmdkcli
cd /tmp
unzip mdk-cli.zip

4) Configuration npm (1 fois)

npm config set proxy http://ntes.proxy.corp.sopra:8080
npm config set https-proxy http://ntes.proxy.corp.sopra:8080

5) Build

cd mdk-cli
npm install