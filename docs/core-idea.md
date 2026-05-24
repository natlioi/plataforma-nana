
## O que é a plataforma

Um hub único pros alunos da Natália (inglês e francês) acessarem material, fazer dever de casa, acompanhar progresso e continuar aprendendo entre as aulas. MVP pros alunos dela primeiro, construído com Claude Code + Supabase + GitHub.

## Dor principal a resolver

O aluno quer **se comunicar e se expressar** no idioma. Tudo que não atacar isso diretamente é feature secundária.

## Core features (MVP)

**1. Perfil + progresso do aluno**
Página inicial com nome, nível CEFR atual (A1 a C2), e progress bar de XP. Se o aluno ainda não tem nível mensurado, CTA "Measure your level" leva a um quiz de proficiência.

**2. Dicionário personalizado (o grande diferencial)**
Esse é o momento AHA. Fluxo:
- Aula acontece no Zoom/Meet com transcrição (AI Notes)
- Sistema pega a transcrição, identifica palavras novas que o aluno aprendeu
- Filtra por nível do aluno (iniciante recebe palavras de iniciante, com limite pra não inundar)
- Joga no dicionário pessoal dele dentro da plataforma

**3. Flashcards**
Branch direto do dicionário. As palavras viram flashcards pra revisão.

**4. Deveres de casa dentro da plataforma**
Aluno faz a lição diretamente ali. Não em PDF solto, não em Google Doc. Plataforma unificada.

**5. Biblioteca de materiais**
Acesso aos materiais das aulas, organizados.

**6. Calendário de aulas**
Quando é a próxima aula, integração com Google Calendar. Opcional: campo "o que você quer focar na próxima aula?" pra Natália preparar.

## Features secundárias (depois do MVP)

Estão validadas como ideia mas ficam pra v2:
- Comunidade entre alunos
- Conversação em grupo exclusivo (upsell pra receita)
- AI conversation pra tirar dúvidas
- Checador de pronúncia
- Phrasal verb of the day
- Descrever imagem corrigido por IA
- Conteúdo regional (vocab de Canadá vs UK vs Austrália)
- Sistema member-get-member (5% no próximo mês)

## Mapeamento no funil (rápido)

- **Aquisição**: divulgação + freemium + fotos/vídeos de alunos usando como criativo
- **Ativação**: dicionário personalizado gerado pós-primeira aula + completar primeiro dever na plataforma
- **Retenção**: progress bar + materiais + lugar único pra dever de casa
- **Receita**: upsell de grupos de conversação exclusivos
- **Referral**: member-get-member com desconto no próximo mês