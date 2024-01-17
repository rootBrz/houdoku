import React, { useEffect, useState } from 'react';
import aki, { RegistrySearchResults } from 'aki-plugin-manager';
import log from 'electron-log';
import { useLocation } from 'react-router-dom';
import { Button, Group, Mark, Table, Text } from '@mantine/core';
import { ipcRenderer } from 'electron';
import { gt } from 'semver';
import { useListState } from '@mantine/hooks';
import ipcChannels from '../../constants/ipcChannels.json';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const Plugins: React.FC<Props> = () => {
  const [currentTiyoVersion, setCurrentTiyoVersion] = useState<string | undefined>(undefined);
  const [availableTiyoVersion, setAvailableTiyoVersion] = useState<string | undefined>(undefined);

  const [installingPlugins, installingPluginsHandlers] = useListState<string>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [reloading, setReloading] = useState(false);
  const location = useLocation();

  const refreshMetadata = async () => {
    setRefreshing(true);
    setCurrentTiyoVersion(undefined);
    setAvailableTiyoVersion(undefined);

    const currentVersion = await ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.GET_TIYO_VERSION);
    setCurrentTiyoVersion(currentVersion);

    await aki
      .search('core', 'tiyo', 1)
      .then((results: RegistrySearchResults) => {
        if (results.objects.length > 0) {
          setAvailableTiyoVersion(results.objects[0].package.version);
        }
      })
      .catch((e) => log.error(e));
    setRefreshing(false);
  };

  const handleInstall = (pkgName: string, version: string) => {
    log.info(`Installing plugin ${pkgName}@${version}`);
    installingPluginsHandlers.append(pkgName);

    ipcRenderer
      .invoke(ipcChannels.EXTENSION_MANAGER.INSTALL, pkgName, version)
      .then(() => ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.RELOAD))
      .then(() => refreshMetadata())
      .catch((e) => log.error(e))
      .finally(() => installingPluginsHandlers.filter((item) => item !== pkgName))
      .catch((e) => log.error(e));
  };

  const handleRemove = (pkgName: string) => {
    log.info(`Removing plugin ${pkgName}...`);

    ipcRenderer
      .invoke(ipcChannels.EXTENSION_MANAGER.UNINSTALL, pkgName)
      .then(() => ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.RELOAD))
      .then(() => refreshMetadata())
      .catch((e) => log.error(e));
  };

  const reloadPlugins = async () => {
    setReloading(true);
    await ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.RELOAD).catch((e) => log.error(e));
    setReloading(false);
    refreshMetadata();
  };

  useEffect(() => {
    refreshMetadata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const tiyoCanUpdate =
    currentTiyoVersion && availableTiyoVersion && gt(currentTiyoVersion, availableTiyoVersion);

  return (
    <>
      <Group position="left" align="left" mb="md" spacing="sm" noWrap>
        <Button loading={refreshing} onClick={() => refreshMetadata()}>
          Check for Updates
        </Button>
        <Button
          variant="default"
          loading={reloading}
          onClick={() => reloadPlugins()}
          disabled={currentTiyoVersion === undefined}
        >
          Reload Installed Plugins
        </Button>
      </Group>

      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>
              <Text align="center">Version</Text>
            </th>
            <th> </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Text size="md">Tiyo Extension Manager</Text>
            </td>
            <td>
              <Text size="md">
                Adds support for importing content from other sources, including 3rd-party websites.
              </Text>
            </td>
            <td>
              <Text size="md" align="center">
                {availableTiyoVersion === currentTiyoVersion || !currentTiyoVersion ? (
                  availableTiyoVersion
                ) : (
                  <Text>
                    {currentTiyoVersion}→<Mark color="teal">{availableTiyoVersion}</Mark>
                  </Text>
                )}
              </Text>
            </td>
            <td>
              <Group spacing="xs" position="right">
                {tiyoCanUpdate ? (
                  <Button onClick={() => handleInstall('@tiyo/core', availableTiyoVersion)}>
                    Update
                  </Button>
                ) : (
                  ''
                )}
                {currentTiyoVersion === undefined && availableTiyoVersion !== undefined ? (
                  <Button
                    loading={installingPlugins.includes('@tiyo/core')}
                    variant="default"
                    onClick={() => handleInstall('@tiyo/core', availableTiyoVersion)}
                  >
                    {installingPlugins.includes('@tiyo/core') ? 'Installing...' : 'Install'}
                  </Button>
                ) : (
                  <Button variant="filled" color="red" onClick={() => handleRemove('@tiyo/core')}>
                    Uninstall
                  </Button>
                )}
              </Group>
            </td>
          </tr>
        </tbody>
      </Table>
    </>
  );
};

export default Plugins;
