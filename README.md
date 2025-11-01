diff --git a/README.md b/README.md
index e2c4edfd27373e25206e60590df828f0f7d10f5e..dcd133ff1b82ae6407f5d4fcfc77a1c30b329d8a 100644
--- a/README.md
+++ b/README.md
@@ -1 +1,28 @@
-# appacademia
\ No newline at end of file
+# App Academia
+
+Aplicativo mobile (Expo/React Native) com três perfis de acesso para academias:
+
+- **Administrador**: cadastra novos exercícios com grupo muscular, equipamento e descrição.
+- **Professor**: monta fichas de treino selecionando exercícios e definindo carga, repetições e tempo de descanso, além de atribuir planos aos alunos cadastrados.
+- **Aluno**: visualiza os treinos atribuídos e utiliza o cronômetro de descanso para cada exercício.
+
+## Executando o projeto
+
+1. Instale as dependências:
+
+   ```bash
+   npm install
+   ```
+
+2. Inicie o Metro bundler:
+
+   ```bash
+   npm start
+   ```
+
+3. Utilize o aplicativo Expo Go (Android/iOS) ou um emulador para visualizar o app.
+
+## Estrutura principal
+
+- `App.js`: fluxo completo de autenticação simplificada por perfil, cadastro de exercícios, criação de fichas de treino e experiência do aluno com temporizador de descanso.
+- `app.json`, `babel.config.js` e `package.json`: configuração do projeto Expo.
