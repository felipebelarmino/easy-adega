document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section');
    const formProduto = document.getElementById('form-produto');
    const listaProdutos = document.getElementById('lista-produtos');
    const formEntrada = document.getElementById('form-entrada');
    const formSaida = document.getElementById('form-saida');
    const produtoEntrada = document.getElementById('produto-entrada');
    const produtoSaida = document.getElementById('produto-saida');
    const totalProdutosSpan = document.getElementById('total-produtos');
    const totalEntradasSpan = document.getElementById('total-entradas');
    const totalSaidasSpan = document.getElementById('total-saidas');
    const estoqueAtualSpan = document.getElementById('estoque-atual');
    const tabelaProdutos = document.getElementById('tabela-produtos');
    const formCustos = document.getElementById('form-custos');

    let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    let totalEntradas = 0;
    let totalSaidas = 0;
    let custosFixos = JSON.parse(localStorage.getItem('custosFixos')) || {
        aluguel: 0,
        luz: 0,
        agua: 0,
        funcionarios: 0,
        capitalGiro: 0
    };

    window.showSection = function(sectionId) {
        sections.forEach(section => section.classList.remove('active'));
        document.getElementById(sectionId).classList.add('active');
        if (sectionId === 'home') {
            atualizarInformacoesGerais();
        }
    };

    function atualizarListaProdutos() {
        listaProdutos.innerHTML = '';
        produtoEntrada.innerHTML = '';
        produtoSaida.innerHTML = '';
        produtos.forEach((produto, index) => {
            const li = document.createElement('li');
            li.textContent = `${produto.nome} - Quantidade: ${produto.quantidade}`;
            listaProdutos.appendChild(li);
            const optionEntrada = document.createElement('option');
            optionEntrada.value = index;
            optionEntrada.textContent = produto.nome;
            produtoEntrada.appendChild(optionEntrada);
            const optionSaida = document.createElement('option');
            optionSaida.value = index;
            optionSaida.textContent = produto.nome;
            produtoSaida.appendChild(optionSaida);
        });
    }

    function atualizarInformacoesGerais() {
        tabelaProdutos.innerHTML = '';
        let totalEstoque = 0;
        produtos.forEach(produto => {
            totalEstoque += produto.quantidade;
            const precoCusto = produto.precoCusto || 0;
            const margemLucro = produto.margemLucro || 0;
            const precoVenda = precoCusto * (1 + margemLucro / 100);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${produto.nome}</td>
                <td>${produto.quantidade}</td>
                <td>R$ ${precoCusto.toFixed(2)}</td>
                <td>${margemLucro}%</td>
                <td>R$ ${precoVenda.toFixed(2)}</td>
            `;
            tabelaProdutos.appendChild(tr);
        });
        totalProdutosSpan.textContent = produtos.length;
        totalEntradasSpan.textContent = totalEntradas;
        totalSaidasSpan.textContent = totalSaidas;
        estoqueAtualSpan.textContent = totalEstoque;
    }

    formProduto.addEventListener('submit', function(event) {
        event.preventDefault();
        const nome = document.getElementById('nome-produto').value;
        const quantidade = parseInt(document.getElementById('quantidade-produto').value);
        const precoCusto = parseFloat(document.getElementById('preco-custo-produto').value);
        const margemLucro = parseInt(document.getElementById('margem-lucro-produto').value);
        produtos.push({ nome, quantidade, precoCusto, margemLucro });
        localStorage.setItem('produtos', JSON.stringify(produtos));
        atualizarListaProdutos();
        formProduto.reset();
        atualizarInformacoesGerais();
    });

    formEntrada.addEventListener('submit', function(event) {
        event.preventDefault();
        const index = parseInt(produtoEntrada.value);
        const quantidade = parseInt(document.getElementById('quantidade-entrada').value);
        produtos[index].quantidade += quantidade;
        totalEntradas += quantidade;
        localStorage.setItem('produtos', JSON.stringify(produtos));
        atualizarListaProdutos();
        formEntrada.reset();
        atualizarInformacoesGerais();
    });

    formSaida.addEventListener('submit', function(event) {
        event.preventDefault();
        const index = parseInt(produtoSaida.value);
        const quantidade = parseInt(document.getElementById('quantidade-saida').value);
        produtos[index].quantidade -= quantidade;
        totalSaidas += quantidade;
        localStorage.setItem('produtos', JSON.stringify(produtos));
        atualizarListaProdutos();
        formSaida.reset();
        atualizarInformacoesGerais();
    });

    formCustos.addEventListener('submit', function(event) {
        event.preventDefault();
        custosFixos.aluguel = parseFloat(document.getElementById('aluguel').value);
        custosFixos.luz = parseFloat(document.getElementById('luz').value);
        custosFixos.agua = parseFloat(document.getElementById('agua').value);
        custosFixos.funcionarios = parseFloat(document.getElementById('funcionarios').value);
        custosFixos.capitalGiro = parseFloat(document.getElementById('capital-giro').value);
        localStorage.setItem('custosFixos', JSON.stringify(custosFixos));
        alert('Custos salvos com sucesso!');
    });

    window.gerarRelatorio = function() {
        const relatorio = document.getElementById('relatorio');
        relatorio.innerHTML = '<h3>Relatório de Estoque</h3>';
        let lucroTotal = 0;
        produtos.forEach(produto => {
            const precoCusto = produto.precoCusto || 0;
            const margemLucro = produto.margemLucro || 0;
            const precoVenda = precoCusto * (1 + margemLucro / 100);
            const lucroPorProduto = (precoVenda - precoCusto) * produto.quantidade;
            lucroTotal += lucroPorProduto;
            const p = document.createElement('p');
            p.textContent = `${produto.nome}: Quantidade: ${produto.quantidade}, Preço de Venda: R$ ${precoVenda.toFixed(2)}, Lucro: R$ ${lucroPorProduto.toFixed(2)}`;
            relatorio.appendChild(p);
        });

        const custoTotalMensal = custosFixos.aluguel + custosFixos.luz + custosFixos.agua + custosFixos.funcionarios;
        const lucroMensal = lucroTotal - custoTotalMensal;
        const lucroSemanal = lucroMensal / 4;

        const pLucroMensal = document.createElement('p');
        pLucroMensal.textContent = `Lucro Mensal: R$ ${lucroMensal.toFixed(2)}`;
        pLucroMensal.style.color = lucroMensal >= 0 ? 'green' : 'red';
        relatorio.appendChild(pLucroMensal);

        const pLucroSemanal = document.createElement('p');
        pLucroSemanal.textContent = `Lucro Semanal: R$ ${lucroSemanal.toFixed(2)}`;
        pLucroSemanal.style.color = lucroSemanal >= 0 ? 'green' : 'red';
        relatorio.appendChild(pLucroSemanal);

        const pRetirada = document.createElement('p');
        const retiradaLucro = lucroMensal > 0 ? lucroMensal * 0.5 : 0;
        pRetirada.textContent = `Retirada de Lucro: R$ ${retiradaLucro.toFixed(2)}`;
        relatorio.appendChild(pRetirada);

        const pCapitalGiro = document.createElement('p');
        const capitalParaGiro = custosFixos.capitalGiro + (lucroMensal - retiradaLucro);
        pCapitalGiro.textContent = `Capital de Giro Disponível: R$ ${capitalParaGiro.toFixed(2)}`;
        relatorio.appendChild(pCapitalGiro);
    };

    atualizarListaProdutos();
    atualizarInformacoesGerais();
});
