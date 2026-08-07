---
name: orquestrador-desenvolvimento
description: 'Orquestra desenvolvimento ponta a ponta: revisar arquitetura, gerar documentacao tecnica, planejar e executar deploy, gerenciar bancos, desenhar e implementar CRUD, montar planos de execucao e criar subagentes para tarefas recorrentes e integracoes. Use quando precisar coordenar multiplas frentes com criterio tecnico e verificacao final.'
argument-hint: 'Objetivo principal, contexto do projeto, restricoes e prioridade'
user-invocable: true
disable-model-invocation: false
---

# Orquestrador de Desenvolvimento

## O que esta skill produz
- Plano tecnico executavel para uma demanda complexa.
- Decisoes de arquitetura com criterios explicitos.
- Entregaveis de implementacao (ex.: CRUD, integracoes, APIs, ajustes de infraestrutura).
- Documentacao objetiva para operacao e continuidade.
- Estrategia de deploy com validacao e rollback, sem prender em alvo unico.
- Criacao automatica de subagentes para tarefas repetitivas.

## Quando usar
- Quando uma tarefa cruza backend, frontend, banco e deploy.
- Quando a demanda exige priorizacao entre velocidade e risco.
- Quando precisa transformar pedidos amplos em execucao verificavel.
- Quando ha necessidade de padronizar processo em workflow reutilizavel.

## Entradas esperadas
- Objetivo de negocio e resultado esperado.
- Escopo tecnico (sistemas, repositorios, servicos, ambientes).
- Restricoes (prazo, seguranca, compliance, custo, janela de deploy).
- Criterios de aceite.

## Workflow completo
1. Entender objetivo e limites
- Reescrever o pedido em termos tecnicos verificaveis.
- Identificar ambiguidades e lacunas criticas.
- Definir sucesso com criterios objetivos.

2. Diagnosticar contexto atual
- Mapear arquitetura existente, convencoes e dependencias.
- Levantar riscos de regressao, seguranca e dados.
- Separar o que e urgente do que e estrutural.

3. Definir estrategia e trilhas
- Escolher abordagem incremental ou por frentes paralelas.
- Definir ordem de execucao com menor risco primeiro.
- Registrar trade-offs: tempo, custo, manutencao e confiabilidade.

4. Projetar modelagem e contratos
- Para banco: entidades, relacionamentos, migracoes, indices e politicas de acesso.
- Para API: contratos de entrada/saida, validacao, erros e auditoria.
- Para CRUD (agnostico de stack): casos de uso, permissao por perfil e regras de negocio.

5. Implementar por incrementos verificaveis
- Entregar em blocos pequenos (planejar, codar, validar).
- Evitar mudancas amplas sem validacao intermediaria.
- Atualizar documentacao junto com o codigo.

6. Planejar e executar deploy com seguranca
- Definir checklist de pre-deploy.
- Executar estrategia de rollout (gradual quando aplicavel).
- Garantir plano de rollback e monitoramento inicial.

7. Encerrar com evidencia
- Listar o que foi entregue e o que ficou pendente.
- Apontar riscos residuais e proximos passos.
- Registrar comandos, caminhos e decisoes chave.

## Pontos de decisao (branching)
- Se o escopo estiver vago: pausar implementacao e transformar em objetivos verificaveis.
- Se houver risco alto de dados: priorizar backup, ambiente de teste e plano de rollback.
- Se houver dependencia externa bloqueante: criar plano alternativo e desacoplar entregas.
- Se a demanda se repetir: criar subagente dedicado automaticamente e registrar escopo, gatilhos e limites.

## Criterios de qualidade e conclusao
- Entrega funcional validada contra criterios de aceite.
- Sem regressao conhecida nas areas tocadas.
- Documentacao minima atualizada (arquitetura, operacao, deploy).
- Riscos residuais explicitados com mitigacao.
- Proximos passos priorizados e acionaveis.

## Formato de saida recomendado
- Resumo executivo da solucao.
- Plano de execucao em etapas curtas.
- Mudancas tecnicas realizadas.
- Validacoes executadas e resultados.
- Riscos, rollback e monitoramento.
- Sugestoes de automacao (subagentes/skills).
