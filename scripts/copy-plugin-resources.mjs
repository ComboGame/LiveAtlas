// Копирует собранный фронтенд и plugin.yml в ресурсы Maven-плагина (замена cpy-cli).
import {cpSync, mkdirSync} from 'node:fs';
import {resolve} from 'node:path';

const root = resolve(import.meta.dirname, '..'),
	target = resolve(root, 'java/target/resources');

mkdirSync(target, {recursive: true});
cpSync(resolve(root, 'plugin.yml'), resolve(target, 'plugin.yml'));
cpSync(resolve(root, 'dist'), resolve(target, 'dist'), {recursive: true});
