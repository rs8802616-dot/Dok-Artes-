# REGRAS DO PROJETO PARA AGENTES DE IA (AGENTS.md)

> Este arquivo é injetado automaticamente nas instruções do sistema do agente AI Studio.

## 📌 REGRA CRÍTICA DE DOCUMENTAÇÃO

1. **LEITURA OBRIGATÓRIA ANTES DE QUALQUER MODIFICAÇÃO:**
   - Sempre chame `view_file` no arquivo `/DOCUMENTACAO-PROJETO.md` antes de executar qualquer alteração solicitada pelo usuário.
   - Entenda o estado real, as ferramentas já implementadas, as estruturas de dados e a arquitetura do projeto a partir do documento antes de criar ou editar código.

2. **ATUALIZAÇÃO OBRIGATÓRIA AO FINALIZAR:**
   - Após implementar as alterações solicitadas e antes de encerrar o turno, atualize `/DOCUMENTACAO-PROJETO.md`:
     - Se novos componentes, utilitários, tipos ou fluxos foram criados, documente-os nas seções correspondentes.
     - Adicione uma entrada na seção **6. Histórico de Alterações (Changelog)** com a data e um resumo objetivo do que foi implementado/modificado.
   - Verifique sempre a compilação com `compile_applet` antes de finalizar.
