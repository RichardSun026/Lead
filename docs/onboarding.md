# Cadastro do Corretor

Este breve guia explica como vincular um Google Calendar para que as reservas criadas pelo site e pela IA permaneçam sincronizadas.

## Sign in with Google

The onboarding now starts by clicking **Sign in with Google**. After completing the Google consent screen you will be redirected back to the onboarding page to continue with step 2.

O painel administrativo exibe um botão **Conectar Google Calendar** durante o processo de cadastro. Ao clicar, a tela de consentimento do Google é aberta usando o endpoint `/api/calendar/oauth/<realtorId>`. Após conceder acesso, o backend recebe um token de atualização para que as próximas chamadas de calendário funcionem sem novas solicitações.

1. Garanta que o backend esteja em execução e acessível. A variável de ambiente `GOOGLE_REDIRECT_URI` deve apontar para
   `https://br.myrealvaluation.com/api/calendar/oauth/callback` (ou para a sua URL implantada).
2. Obtenha seu link de autorização pessoal executando:
   ```bash
   curl https://br.myrealvaluation.com/api/calendar/oauth/<realtorId>
   ```
   A resposta contém um campo `url`. Abra-o no navegador.
3. Conceda acesso à conta do Google solicitada e confirme a tela de consentimento.
4. Após a aprovação você será redirecionado diretamente para `/console`. O backend
   salva automaticamente seu token de atualização do Google para que futuras chamadas de calendário funcionem
   sem etapas adicionais.

Após concluir esse fluxo, o aplicativo poderá criar, atualizar e excluir
eventos de calendário sem solicitar permissão novamente. Os tokens são
renovados automaticamente.

## Adicionando seu site e vídeo de apresentação

Durante o passo 2 do cadastro você pode fornecer opcionalmente dois campos extras:

1. **URL do site** – cole o link para seu site pessoal ou página de anúncios.
2. **Embed de vídeo** – copie o código de incorporação do Vimeo. Ele deve começar
   com `<iframe src="https://player.vimeo.com`.

Se não conseguir seguir estas instruções, envie um email para
`admin@myrealvaluation.com` e corrigiremos manualmente para você.
