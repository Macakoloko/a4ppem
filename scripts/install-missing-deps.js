/**
 * Script para instalar dependências do Radix UI potencialmente faltantes
 */

const { execSync } = require('child_process');

console.log('Instalando dependências potencialmente faltantes do Radix UI...');

const dependencies = [
  '@radix-ui/react-switch',
  '@radix-ui/react-avatar', 
  '@radix-ui/react-checkbox',
  '@radix-ui/react-scroll-area',
  '@radix-ui/react-separator',
  '@radix-ui/react-accordion',
  '@radix-ui/react-context-menu',
  '@radix-ui/react-toast',
  '@radix-ui/react-menubar',
  '@radix-ui/react-hover-card',
  '@radix-ui/react-navigation-menu',
  '@radix-ui/react-progress',
  '@radix-ui/react-radio-group',
  '@radix-ui/react-toggle',
  '@radix-ui/react-toggle-group',
  'recharts'
];

try {
  // Instala todas as dependências
  execSync(`npm install ${dependencies.join(' ')}`, { stdio: 'inherit' });
  console.log('Todas as dependências foram instaladas com sucesso.');
} catch (error) {
  console.error('Erro ao instalar dependências:', error.message);
  process.exit(1);
} 