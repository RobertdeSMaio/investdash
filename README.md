# InvestDash 📈
Dashboard moderno para gestão de investimentos e análise de ativos.

O InvestDash é uma site de alta performance desenvolvida com React e Vite. O projeto oferece uma interface intuitiva para monitoramento de carteira, utilizando as melhores práticas de formulários e visualização de dados.

# 🛠️ Tecnologias e Bibliotecas
## Frontend Core
React + Vite: Performance otimizada e Hot Module Replacement (HMR) ultrarrápido.

React Router Dom: Gestão de rotas e navegação.

Formulários e Validação
Formik: Utilizado para gerenciar o estado dos formulários de login e cadastro, garantindo uma manipulação de dados limpa e eficiente.

Yup: (Comumente usado com Formik) Para validação de esquemas de formulários (email válido, senha forte, etc).

Estilização e UI
Tailwind CSS: Estilização baseada em utilitários para um design responsivo.

Lucide React: Biblioteca de ícones.

## Gráficos e Dados
Recharts / Chart.js: Visualização dinâmica da composição da carteira.

Axios: Cliente HTTP para consumo de APIs de finanças.

🔐 Configuração de Variáveis de Ambiente
Para que o projeto funcione corretamente com APIs externas, você deve configurar as chaves de acesso.

Na raiz do projeto, crie um arquivo chamado .env.

Adicione as suas chaves seguindo o padrão do Vite:

Snippet de código
## Exemplo de configuração
VITE_API_KEY=sua_chave_aqui
VITE_API_URL=https://api.exemplo.com
Nota: No Vite, apenas variáveis iniciadas com VITE_ ficam acessíveis no código via import.meta.env.VITE_API_KEY.

🚀 Como Executar
Clone e instale:

Bash
git clone https://github.com/RobertdeSMaio/investdash.git
cd investdash
npm install
Inicie o servidor:

Bash
npm run dev
📂 Estrutura do Projeto
src/components/: Componentes de UI (Botões, Inputs, Cards).

src/pages/: Páginas da aplicação (Login, Dashboard, Ativos).

src/services/: Configurações de API e chamadas Axios.

src/hooks/: Lógica de estado e autenticação.

## Projeto em construção, backend e banco em construção

https://investdash.vercel.app/
