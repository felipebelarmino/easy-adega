document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll("section");
  const formProduto = document.getElementById("form-produto");
  const listaProdutos = document.getElementById("lista-produtos");
  const formEntrada = document.getElementById("form-entrada");
  const formSaida = document.getElementById("form-saida");
  const produtoEntrada = document.getElementById("produto-entrada");
  const produtoSaida = document.getElementById("produto-saida");
  const totalProdutosSpan = document.getElementById("total-produtos");
  const totalEntradasSpan = document.getElementById("total-entradas");
  const totalSaidasSpan = document.getElementById("total-saidas");
  const estoqueAtualSpan = document.getElementById("estoque-atual");
  const tabelaProdutos = document.getElementById("tabela-produtos");
  const formCustos = document.getElementById("form-custos");

  let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
  let entradas = JSON.parse(localStorage.getItem("entradas")) || [];
  let saidas = JSON.parse(localStorage.getItem("saidas")) || [];
  let custosFixos = JSON.parse(localStorage.getItem("custosFixos")) || {
    aluguel: 0,
    luz: 0,
    agua: 0,
    funcionarios: 0,
    capitalGiro: 0,
  };

  window.showSection = function (sectionId) {
    sections.forEach((section) => section.classList.remove("active"));
    document.getElementById(sectionId).classList.add("active");
    if (sectionId === "home") {
      atualizarInformacoesGerais();
    }
  };

  function atualizarListaProdutos() {
    listaProdutos.innerHTML = "";
    produtoEntrada.innerHTML = "";
    produtoSaida.innerHTML = "";
    produtos.forEach((produto, index) => {
      const li = document.createElement("li");
      li.textContent = `${produto.nome} - Quantidade: ${produto.quantidade}`;
      listaProdutos.appendChild(li);
      const optionEntrada = document.createElement("option");
      optionEntrada.value = index;
      optionEntrada.textContent = produto.nome;
      produtoEntrada.appendChild(optionEntrada);
      const optionSaida = document.createElement("option");
      optionSaida.value = index;
      optionSaida.textContent = produto.nome;
      produtoSaida.appendChild(optionSaida);
    });
  }

  function atualizarInformacoesGerais() {
    tabelaProdutos.innerHTML = "";
    let totalEstoque = 0;
    produtos.forEach((produto, index) => {
      totalEstoque += produto.quantidade;
      const precoCusto = produto.precoCusto || 0;
      const margemLucro = produto.margemLucro || 0;
      const precoVenda = precoCusto * (1 + margemLucro / 100);
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${produto.nome}</td>
                <td>${produto.quantidade}</td>
                <td>R$ ${precoCusto.toFixed(2)}</td>
                <td>${margemLucro}%</td>
                <td>R$ ${precoVenda.toFixed(2)}</td>
                <td><button onclick="removerProduto(${index})">Remover</button></td>
            `;
      tabelaProdutos.appendChild(tr);
    });
    totalProdutosSpan.textContent = produtos.length;
    totalEntradasSpan.textContent = entradas.length;
    totalSaidasSpan.textContent = saidas.length;
    estoqueAtualSpan.textContent = totalEstoque;
  }

  window.removerProduto = function (index) {
    produtos.splice(index, 1);
    localStorage.setItem("produtos", JSON.stringify(produtos));
    atualizarListaProdutos();
    atualizarInformacoesGerais();
  };

  window.confirmarLimpeza = function () {
    if (
      confirm(
        "Tem certeza de que deseja limpar todos os dados? Esta ação não pode ser desfeita."
      )
    ) {
      limparDados();
    }
  };

  window.limparDados = function () {
    localStorage.removeItem("produtos");
    localStorage.removeItem("entradas");
    localStorage.removeItem("saidas");
    localStorage.removeItem("custosFixos");
    produtos = [];
    entradas = [];
    saidas = [];
    custosFixos = {
      aluguel: 0,
      luz: 0,
      agua: 0,
      funcionarios: 0,
      capitalGiro: 0,
    };
    atualizarListaProdutos();
    atualizarInformacoesGerais();
    alert("Dados limpos com sucesso!");
  };

  formProduto.addEventListener("submit", function (event) {
    event.preventDefault();
    const nome = document.getElementById("nome-produto").value;
    const quantidade = parseInt(
      document.getElementById("quantidade-produto").value
    );
    const precoCusto = parseFloat(
      document.getElementById("preco-custo-produto").value
    );
    const margemLucro = parseInt(
      document.getElementById("margem-lucro-produto").value
    );
    produtos.push({ nome, quantidade, precoCusto, margemLucro });
    localStorage.setItem("produtos", JSON.stringify(produtos));
    atualizarListaProdutos();
    formProduto.reset();
    atualizarInformacoesGerais();
  });

  formEntrada.addEventListener("submit", function (event) {
    event.preventDefault();
    const index = parseInt(produtoEntrada.value);
    const quantidade = parseInt(
      document.getElementById("quantidade-entrada").value
    );
    produtos[index].quantidade += quantidade;
    entradas.push({ produto: produtos[index].nome, quantidade });
    localStorage.setItem("produtos", JSON.stringify(produtos));
    localStorage.setItem("entradas", JSON.stringify(entradas));
    atualizarListaProdutos();
    formEntrada.reset();
    atualizarInformacoesGerais();
  });

  formSaida.addEventListener("submit", function (event) {
    event.preventDefault();
    const index = parseInt(produtoSaida.value);
    const quantidade = parseInt(
      document.getElementById("quantidade-saida").value
    );
    produtos[index].quantidade -= quantidade;
    saidas.push({ produto: produtos[index].nome, quantidade });
    localStorage.setItem("produtos", JSON.stringify(produtos));
    localStorage.setItem("saidas", JSON.stringify(saidas));
    atualizarListaProdutos();
    formSaida.reset();
    atualizarInformacoesGerais();
  });

  formCustos.addEventListener("submit", function (event) {
    event.preventDefault();
    custosFixos.aluguel = parseFloat(document.getElementById("aluguel").value);
    custosFixos.luz = parseFloat(document.getElementById("luz").value);
    custosFixos.agua = parseFloat(document.getElementById("agua").value);
    custosFixos.funcionarios = parseFloat(
      document.getElementById("funcionarios").value
    );
    custosFixos.capitalGiro = parseFloat(
      document.getElementById("capital-giro").value
    );
    localStorage.setItem("custosFixos", JSON.stringify(custosFixos));
    alert("Custos salvos com sucesso!");
  });

  window.gerarRelatorio = function () {
    const relatorio = document.getElementById("relatorio");
    relatorio.innerHTML = "<h3>Relatório de Estoque</h3>";

    // Tabela de produtos
    let table = document.createElement("table");
    table.innerHTML = `
            <tr>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Preço de Venda</th>
                <th>Lucro Estimado</th>
                <th>Lucro Real</th>
            </tr>
        `;
    let lucroEstimadoTotal = 0;
    let lucroRealTotal = 0;
    produtos.forEach((produto) => {
      const precoCusto = produto.precoCusto || 0;
      const margemLucro = produto.margemLucro || 0;
      const precoVenda = precoCusto * (1 + margemLucro / 100);
      const quantidadeVendida = saidas
        .filter((saida) => saida.produto === produto.nome)
        .reduce((acc, saida) => acc + saida.quantidade, 0);
      const lucroEstimadoPorProduto =
        (precoVenda - precoCusto) * produto.quantidade;
      const lucroRealPorProduto = (precoVenda - precoCusto) * quantidadeVendida;
      lucroEstimadoTotal += lucroEstimadoPorProduto;
      lucroRealTotal += lucroRealPorProduto;
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${produto.nome}</td>
                <td>${produto.quantidade}</td>
                <td>R$ ${precoVenda.toFixed(2)}</td>
                <td>R$ ${lucroEstimadoPorProduto.toFixed(2)}</td>
                <td>R$ ${lucroRealPorProduto.toFixed(2)}</td>
            `;
      table.appendChild(row);
    });
    relatorio.appendChild(table);

    // Tabela de lucros
    const custoTotalMensal =
      custosFixos.aluguel +
      custosFixos.luz +
      custosFixos.agua +
      custosFixos.funcionarios;
    const lucroMensalEstimado = lucroEstimadoTotal - custoTotalMensal;
    const lucroSemanalEstimado = lucroMensalEstimado / 4;
    const lucroMensalReal = lucroRealTotal - custoTotalMensal;
    const lucroSemanalReal = lucroMensalReal / 4;

    let lucroTable = document.createElement("table");
    lucroTable.innerHTML = `
            <tr>
                <th></th>
                <th>Estimado</th>
                <th>Real</th>
            </tr>
            <tr>
                <td>Lucro</td>
                <td style="color: ${
                  lucroMensalEstimado >= 0 ? "green" : "red"
                };">R$ ${lucroMensalEstimado.toFixed(2)}</td>
                <td style="color: ${
                  lucroMensalReal >= 0 ? "green" : "red"
                };">R$ ${lucroMensalReal.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Retirada de Lucro</td>
                <td>R$ ${
                  lucroMensalEstimado > 0
                    ? (lucroMensalEstimado * 0.5).toFixed(2)
                    : "0.00"
                }</td>
                <td>R$ ${
                  lucroMensalReal > 0
                    ? (lucroMensalReal * 0.5).toFixed(2)
                    : "0.00"
                }</td>
            </tr>
            <tr>
                <td>Capital de Giro Disponível</td>
                <td>R$ ${(
                  custosFixos.capitalGiro +
                  (lucroMensalEstimado -
                    (lucroMensalEstimado > 0 ? lucroMensalEstimado * 0.5 : 0))
                ).toFixed(2)}</td>
                <td>R$ ${(
                  custosFixos.capitalGiro +
                  (lucroMensalReal -
                    (lucroMensalReal > 0 ? lucroMensalReal * 0.5 : 0))
                ).toFixed(2)}</td>
            </tr>
        `;
    relatorio.appendChild(lucroTable);
  };

  atualizarListaProdutos();
  atualizarInformacoesGerais();
});
