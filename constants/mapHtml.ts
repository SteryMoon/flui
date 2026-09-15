export const mapHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #0E1B22; }

    .leaflet-control-attribution {
    background: rgba(14, 27, 34, 0.75);
    color: #8FA3AD;
    font-size: 9px;
    }
    .leaflet-control-attribution a { color: #47B7F8; }

    /* Bolha do marcador */
    .flui-pin {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 9px;
    border-radius: 14px;
    border: 2px solid rgba(14, 27, 34, 0.9);
    color: #0E1B22;
    font: 700 12px/1 -apple-system, Roboto, sans-serif;
    white-space: nowrap;
    transition: transform 120ms ease;
    }
    .flui-pin.selecionado { transform: scale(1.18); }
    .flui-icone { font-size: 12px; }
</style>
</head>
<body>
<div id="map"></div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
    var mapa = L.map('map', { zoomControl: false, attributionControl: true })
    .setView([-23.5735, -46.6688], 12);

    L.tileLayer(
    'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=cb1_3mk5_1_31f4c0d4eecf05cca5d3c0d8',
    { attribution: '&copy; OpenStreetMap &copy; CARTO', maxZoom: 19 }
    ).addTo(mapa);

    var camadaPinos = L.layerGroup().addTo(mapa);

    function enviar(dados) {
    if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(dados));
    }
    }

    /* Toque no mapa vazio limpa a seleção. */
    mapa.on('click', function () {
    enviar({ tipo: 'limpar' });
    });

    function desenharPinos(pontos, selecionadoId) {
    camadaPinos.clearLayers();

    pontos.forEach(function (ponto) {
        var icone = ponto.rapido ? '⚡' : '🔌';
        var classe = 'flui-pin' + (ponto.id === selecionadoId ? ' selecionado' : '');

        var html =
        '<div class="' + classe + '" style="background:' + ponto.cor + '">' +
        '<span class="flui-icone">' + icone + '</span>' +
        '<span>' + ponto.potencia + ' kW</span>' +
        '</div>';

        var marcador = L.marker([ponto.lat, ponto.lng], {
        icon: L.divIcon({
            html: html,
            className: '',
            iconSize: null,
            iconAnchor: [34, 14]
        }),
          /* Rótulo lido por leitores de tela e mostrado ao pressionar. */
        title: ponto.rotulo,
        alt: ponto.rotulo
        });

        marcador.on('click', function () {
        enviar({ tipo: 'ponto', id: ponto.id });
        });

        camadaPinos.addLayer(marcador);
    });
    }

    /* Centraliza o mapa num ponto, chamado pelo app. */
    function focar(lat, lng) {
    mapa.flyTo([lat, lng], 15, { duration: 0.6 });
    }

    /* O app injeta window.FLUI_DADOS e chama isto. */
    function aplicar() {
    if (!window.FLUI_DADOS) return;
    desenharPinos(window.FLUI_DADOS.pontos, window.FLUI_DADOS.selecionadoId);
    }
</script>
</body>
</html>
`;