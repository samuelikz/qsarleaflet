<template>
  <q-page class="flex">
    <q-card class="map-card" style="flex:1">
      <div ref="mapEl" class="map" />
    </q-card>

    <q-dialog v-model="aberto">
      <q-card v-if="selecionada" style="width: 480px; max-width: 90vw">
        <q-img v-if="selecionada.foto" :src="selecionada.foto" :alt="selecionada.nome" :ratio="16/9" />

        <q-card-section>
          <div class="text-h6">{{ selecionada.nome }}</div>
          <div class="text-caption text-grey-7">
            <span class="text-capitalize">{{ selecionada.tipo }}</span> · {{ selecionada.bairro }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="row no-wrap items-start q-mb-sm">
            <q-icon name="place" size="20px" class="q-mr-xs text-grey-7" />
            <span>{{ selecionada.endereco }}</span>
          </div>
          <div class="row items-center">
            <q-rating :model-value="selecionada.nota" readonly size="20px" color="amber" class="q-mr-sm" />
            <span>{{ selecionada.nota }} ({{ selecionada.avaliacoes.toLocaleString('pt-BR') }} avaliações)</span>
          </div>
        </q-card-section>

        <q-card-section v-if="selecionada.fotoCredito" class="q-pt-none text-caption">
          <a :href="selecionada.fotoFonte" target="_blank" rel="noopener" class="text-grey-7">
            Foto: {{ selecionada.fotoCredito }} / Wikimedia Commons
          </a>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat color="primary" label="Fechar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { pracas, fonte } from '@/data/pracas.json'

// one overlay per "tipo" in the data; add an entry here to get a new layer in the menu
const camadas = {
  'praça': { label: 'Praças', icon: 'park', color: '#2e7d32' },
  parque: { label: 'Parques', icon: 'forest', color: '#1b5e20' }
}

const esc = s => String(s).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`)

// hover preview; the image box has a fixed size so Leaflet positions the tooltip correctly before it loads
const previa = p => `
  ${p.foto ? `<img class="previa-foto" src="${esc(p.foto)}" alt="">` : ''}
  <strong>${esc(p.nome)}</strong><br>
  ⭐ ${esc(p.nota)} · ${esc(p.bairro)}
`

const mapEl = ref(null)
const aberto = ref(false)
const selecionada = ref(null)
let map

onMounted(() => {
  map = L.map(mapEl.value).setView([-8.06, -34.91], 13)

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Dados: ${esc(fonte)}`
  }).addTo(map)

  const overlays = {}
  for (const [tipo, { label, icon, color }] of Object.entries(camadas)) {
    const cluster = L.markerClusterGroup()
    const divIcon = L.divIcon({
      className: 'someExtraClass',
      iconSize: null,
      iconAnchor: [16, 32],
      html: `<i class="material-icons" style="color:${color}">${icon}</i>`
    })

    const itens = pracas.filter(p => p.tipo === tipo)
    for (const p of itens) {
      L.marker([p.lat, p.lng], { icon: divIcon })
        .bindTooltip(previa(p), { direction: 'top', offset: [0, -32], className: 'previa' })
        .on('click', () => {
          selecionada.value = p
          aberto.value = true
        })
        .addTo(cluster)
    }

    cluster.addTo(map)
    overlays[`<i class="material-icons" style="color:${color}">${icon}</i><span class="camada-nome">${label}</span><span class="camada-qtd">${itens.length}</span>`] = cluster
  }

  L.control.layers(null, overlays, { collapsed: false }).addTo(map)
})

onBeforeUnmount(() => map?.remove())
</script>

<style scoped>
  .map-card {
    width: 100%;
    height: auto;
  }
  .map {
    width: 100%;
    height: 100%;
  }
  .map :deep(.previa) {
    width: 200px;
    white-space: normal;
  }
  .map :deep(.previa-foto) {
    display: block;
    width: 100%;
    height: 110px;
    object-fit: cover;
    border-radius: 3px;
    margin-bottom: 4px;
  }
  .map :deep(.leaflet-control-layers) {
    border: none;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .2);
    padding: 8px 4px;
    font-size: 14px;
    min-width: 180px;
  }
  .map :deep(.leaflet-control-layers-overlays)::before {
    content: 'Camadas';
    display: block;
    padding: 0 8px 6px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .05em;
    color: #757575;
  }
  .map :deep(.leaflet-control-layers-overlays label) {
    margin: 0;
    padding: 4px 8px;
    border-radius: 6px;
    cursor: pointer;
  }
  .map :deep(.leaflet-control-layers-overlays label:hover) {
    background: #f1f8e9;
  }
  .map :deep(.leaflet-control-layers-overlays label > span),
  .map :deep(.leaflet-control-layers-overlays label > span > span) {
    display: flex;
    flex: 1;
    align-items: center;
    gap: 8px;
  }
  .map :deep(.leaflet-control-layers-selector) {
    margin: 0;
    accent-color: #2e7d32;
  }
  .map :deep(.leaflet-control-layers .material-icons) {
    font-size: 20px;
  }
  .map :deep(.camada-nome) {
    flex: 1;
  }
  .map :deep(.camada-qtd) {
    font-size: 12px;
    color: #616161;
    background: #eeeeee;
    border-radius: 10px;
    padding: 0 7px;
  }
  .map :deep(.someExtraClass) {
    cursor: pointer;
  }
  .map :deep(.someExtraClass .material-icons) {
    display: block;
    font-size: 32px;
  }
</style>
