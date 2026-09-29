-- CreateTable
CREATE TABLE "senadores" (
    "codigo" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "nome_completo" TEXT,
    "partido" TEXT,
    "uf" CHAR(2),
    "url_foto" TEXT,
    "em_exercicio" BOOLEAN NOT NULL DEFAULT false,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "senadores_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nome_oficial" TEXT NOT NULL,
    "nome_curto" TEXT,
    "slug" TEXT NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "despesas" (
    "id" INTEGER NOT NULL,
    "senador_codigo" INTEGER NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "fornecedor" TEXT NOT NULL,
    "cpf_cnpj" TEXT NOT NULL,
    "documento" TEXT,
    "data" DATE,
    "valor" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "despesas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remuneracoes" (
    "id" SERIAL NOT NULL,
    "senador_codigo" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "tipo_folha" TEXT NOT NULL,
    "remuneracao_basica" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "vantagens_pessoais" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "gratificacao_natalina" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "diarias" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "auxilios" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "vantagens_indenizatorias" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "outras_eventuais" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "abono_permanencia" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "horas_extras" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "previdencia" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "imposto_renda" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "reversao_teto" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "faltas" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "remuneracao_liquida" DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT "remuneracoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sincronizacoes" (
    "id" SERIAL NOT NULL,
    "fonte" TEXT NOT NULL,
    "ano" INTEGER,
    "iniciada_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizada_em" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "registros" INTEGER NOT NULL DEFAULT 0,
    "erro" TEXT,

    CONSTRAINT "sincronizacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "senadores_uf_idx" ON "senadores"("uf");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nome_oficial_key" ON "categorias"("nome_oficial");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_slug_key" ON "categorias"("slug");

-- CreateIndex
CREATE INDEX "despesas_senador_codigo_ano_idx" ON "despesas"("senador_codigo", "ano");

-- CreateIndex
CREATE INDEX "despesas_categoria_id_ano_idx" ON "despesas"("categoria_id", "ano");

-- CreateIndex
CREATE UNIQUE INDEX "remuneracoes_senador_codigo_ano_mes_tipo_folha_key" ON "remuneracoes"("senador_codigo", "ano", "mes", "tipo_folha");

-- AddForeignKey
ALTER TABLE "despesas" ADD CONSTRAINT "despesas_senador_codigo_fkey" FOREIGN KEY ("senador_codigo") REFERENCES "senadores"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despesas" ADD CONSTRAINT "despesas_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remuneracoes" ADD CONSTRAINT "remuneracoes_senador_codigo_fkey" FOREIGN KEY ("senador_codigo") REFERENCES "senadores"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
