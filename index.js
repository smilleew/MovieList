const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []
// 切換模式旗標
// 0 => 圖片模式
// 1 => 列表模式
let changeModelIndex = 0

let page = 1

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

//顯示模式圖片
const changeModel = document.querySelector('#view-model')
//顯示目前頁碼與模式
const nowInfo = document.querySelector('#web-now-info')

function renderMovieList(data) {
  let rawHTML = ''

  data.forEach(item => {
    //console.log(item)
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
  `
  });
  // processing
  dataPanel.innerHTML = rawHTML
}

function renderMovieListForList(data) {
  let rawHTML = ''

  data.forEach(item => {
    //console.log(item)
    rawHTML += `
      <div class="navbar bg-body-tertiary">
        <div class="container-fluid">
          <h2 class="movie-name">${item.title}</h2>
          <div class="d-flex">
            <button class="btn btn-primary btn-show-movie m-2" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite m-2" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
  `
  });
  // processing
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {

  const data = filteredMovies.length ? filteredMovies : movies

  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalData = document.querySelector('#movie-modal-data')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    //response.data.results
    const data = response.data.results
    modalTitle.innerText = data.title
    modalData.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fuid">`
  })
}

function addToFavorite(id) {

  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)

  if (list.some(movie => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }

  list.push(movie)

  localStorage.setItem('favoriteMovies', JSON.stringify(list))

}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if(event.target.matches('.btn-show-movie')) {
    //console.log(event.target.dataset)
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  
  page = Number(event.target.dataset.page) 
  nowInfo.children[0].textContent = `Now Page: ${page}`
  //依照模式渲染
  if (changeModelIndex === 0) {
    renderMovieList(getMoviesByPage(page))
  } else if (changeModelIndex === 1) {
    renderMovieListForList(getMoviesByPage(page))
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmited(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  
  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword: ' + keyword)
  }

  renderPaginator(filteredMovies.length)
  nowInfo.children[0].textContent = `Now Page: ${page}`
  //renderMovieList(getMoviesByPage(1))

  //依照模式渲染
  if (changeModelIndex === 0) {
    renderMovieList(getMoviesByPage(1))
  } else if (changeModelIndex === 1) {
    renderMovieListForList(getMoviesByPage(1))
  }

})

//切換顯示模式
changeModel.addEventListener('click', function onChangeViewModel(event) {

  // 判斷要用搜尋後的資料還是全部資料
  const renderPage = filteredMovies.length ? filteredMovies.length : movies.length
  renderPaginator(renderPage)
  nowInfo.children[0].textContent = `Now Page: ${page}`

  //依照點擊圖案切換模式
  if (event.target.matches('.image-model')) {
    changeModelIndex = 0
    renderMovieList(getMoviesByPage(page))
    nowInfo.children[1].textContent = `Show Model: Image`
  } else if (event.target.matches('.list-model')) {
    changeModelIndex = 1
    renderMovieListForList(getMoviesByPage(page))
    nowInfo.children[1].textContent = `Show Model: List`
  }
})

axios.get(INDEX_URL).then(response => {
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(page))
})
  .catch((err) => console.log(err))