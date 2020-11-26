import { execJar } from './execjar';

export const generateByJar = (dataSource, params, cb, cmd) => {
  execJar(dataSource, params, cb, cmd);
};
