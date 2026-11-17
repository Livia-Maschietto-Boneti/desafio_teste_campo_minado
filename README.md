Lívia Maschietto Boneti - 24000749-2 Maria Eduarda Bellarmino Duarte 24036202-2
# 1. Introdução
Este projeto aborda as regras de uma versão de Campo Minado com tabuleiro de 18 colunas × 14 linhas, totalizando 252 casas e 40 bombas.
Os casos de teste automatizados verificam se a lógica do jogo segue as regras definidas. Esta página apresenta a atividade e seus cenários; a execução dos testes é feita no código JavaScript.
# 2. Regras de negócio
RN01 — Dimensões do tabuleiro. A partida padrão tem 18 colunas, 14 linhas e 252 casas.
RN02 — Quantidade de bombas. Cada nova partida distribui exatamente 40 bombas pelo tabuleiro.
RN03 — Primeira jogada segura. A primeira casa revelada não pode conter uma bomba. Se necessário, a bomba é realocada sem alterar o total.
RN04 — Casas adjacentes. Uma casa segura indica quantas bombas existem nas até oito casas vizinhas, respeitando as bordas do tabuleiro.
RN05 — Expansão de área vazia. Revelar uma casa sem bombas adjacentes abre as casas seguras conectadas e suas fronteiras numeradas, sem revelar bombas.
RN06 — Bandeiras. É possível marcar e desmarcar casas fechadas. O número de bandeiras não pode ultrapassar o total de bombas.
RN07 — Vitória. A partida é vencida quando todas as casas sem bomba são reveladas.
RN08 — Derrota. Revelar uma bomba depois da primeira jogada encerra a partida e revela as bombas restantes. Ações posteriores não modificam uma partida encerrada.
RN09 — Nova partida. Uma nova partida começa ativa, com todas as casas fechadas, sem bandeiras e sem estado herdado da partida anterior.
# 3. Casos de teste
Caso
Cenário
Resultado esperado
CT01
Criar o tabuleiro padrão
14 linhas, 18 colunas por linha e casas distintas
CT02
Distribuir bombas no tabuleiro padrão
Exatamente 40 bombas
CT03
Contar vizinhos de uma bomba no canto e no centro
Números corretos e limites de vizinhos respeitados
CT04
Revelar uma casa em uma região vazia
Expandir casas seguras conectadas sem revelar bombas
CT05
Revelar uma casa inicialmente ocupada por bomba
Realocar a bomba, manter a primeira jogada segura e preservar o total
CT06
Marcar e desmarcar uma bandeira
Atualizar corretamente a contagem de bandeiras
CT07
Ultrapassar o limite de bandeiras
Recusar a bandeira excedente e preservar a contagem
CT08
Revelar todas as casas seguras
Declarar vitória
CT09
Revelar uma bomba em uma partida iniciada
Declarar derrota, revelar as bombas e bloquear ações posteriores
CT10
Criar uma nova partida
Reiniciar o estado, as bandeiras e as casas reveladas
# 4. Execução dos testes
Os testes são escritos em JavaScript e executados com o runner de testes integrado ao Node.js. Não dependem de JUnit, Maven ou bibliotecas externas. Cada cenário é apresentado individualmente com seu resultado de aprovação ou reprovação.
