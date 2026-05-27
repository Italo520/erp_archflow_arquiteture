# Restrições do Projeto (Constraints) - ArchFlow ERP

Para manter o foco no fechamento do MVP funcional do ERP ArchFlow e garantir a entrega rápida e estável, as seguintes restrições devem ser respeitadas rigorosamente:

## Restrições Tecnológicas e de Stack
1. **Não migrar de ORM**: O projeto deve continuar utilizando Prisma ORM. Nenhuma substituição (como Drizzle ou raw SQL) é permitida.
2. **Não alterar a arquitetura do Next.js**: O framework do projeto é Next.js com App Router. Não migrar rotas ou alterar a estrutura para páginas clássicas (Pages Router).
3. **Não criar microsserviços**: A aplicação deve operar sob uma arquitetura monolítica modularizada com Server Actions e rotas API integradas.
4. **Sem mensageria complexa**: Não introduzir brokers de mensageria complexos (ex: RabbitMQ, Apache Kafka) nesta fase de MVP. Lógicas assíncronas devem ser resolvidas com ferramentas internas do ecossistema.

## Restrições de Escopo e Negócio
5. **Foco em Single-Office (Sem Multi-Tenancy complexo agora)**: O MVP deve focar na operação robusta de um único escritório de arquitetura. O suporte completo a multi-tenancy dinâmico (entidade `Organization` e isolamento severo entre múltiplas empresas) é considerado evolução futura e não faz parte do MVP inicial.
6. **Integrações de E-mail de Desenvolvimento**: Serviços de envio real de e-mails (como Resend ou SendGrid) devem ser mockados ou gerenciados de forma simplificada em desenvolvimento local para evitar bloqueios de tokens ou pagamentos de terceiros.
7. **Serviços Pagos Externos Opcionais**: O sistema não deve ter acoplamento obrigatório a serviços pagos para executar localmente. Ferramentas como Google Maps, Google Calendar e Pusher devem ser secundárias ou configuradas de forma opcional (graceful degradation).

## Restrições de Qualidade e Código
8. **Proibido Placeholders Silenciosos**: Telas ou fluxos incompletos não devem parecer concluídos na interface com falsos botões ou mockups vazios. Devem ser explicitamente classificados como desativados ou sinalizados como em desenvolvimento.
9. **Eliminar Débito de Tipagem (`any`)**: O uso de tipagem genérica `any` ou construções como `(prisma as any)` deve ser removido progressivamente à medida que as rotinas de banco forem atualizadas.
10. **Zero Reescritas de Domínio Total**: Não reiniciar o modelo de domínio do zero. O schema Prisma existente é maduro e deve ser refatorado/estendido incrementalmente, e não descartado.
