{
    let view = {
        el: '.page__sidebar__playlist',
        template: `
            <ul class="page__sidebar__playlist__content"></ul>
        `,
        render(data){
            let $el = $(this.el)
            $el.html(this.template)
            //创建 li
            let {songs} = data
            let liList = songs.map((song)=>{return $('<li></li>').text(song.name).attr('dataSongId' ,song.id)})
            $el.find('ul').empty()
            liList.map((li)=>{
                $el.find('ul').append(li)
            })
        },
        activeItem(li){
            let $li = $(li)
            $li.addClass('active')
                .siblings('.active').removeClass('active')
        },
        clearActive(){
            $(this.el).find('.active').removeClass('active')
        }
    }
    let model = {
        data: {
            songs: [],
        },
        find(){
            var query = new AV.Query('Song')
            return query.find().then((songs)=>{
                this.data.songs = songs.map((song)=>{
                    return {id: song.id, ...song.attributes}
                })
                return songs
            })
        },
    }
    let controller = {
        init(view, model){
            this.view = view
            this.model = model
            this.view.render(this.model.data)
            this.getAllSongs()
            this.bindEvents()
            this.bindEventHub()
        },
        getAllSongs(){
            return this.model.find().then(()=>{
                this.view.render(this.model.data)
            })
        },
        bindEvents(){
            $(this.view.el).on('click', 'li', (e)=>{
                this.view.activeItem(e.currentTarget)
                let songId = e.currentTarget.getAttribute('dataSongId')
                let data
                let songs = this.model.data.songs
                for(let i=0; i<songs.length; i++){
                    if(songs[i].id === songId){
                        data = songs[i]
                        break
                    }
                }
                //深拷贝
                let string = JSON.stringify(data)
                let object = JSON.parse(string)
                window.eventHub.emit('select', object)
            })
        },
        bindEventHub(){
            //监听 newSong 事件，创建 song
            window.eventHub.on('create', (songData)=>{ 
                this.model.data.songs.push(songData)
                this.view.render(this.model.data)
            })
            window.eventHub.on('new', ()=>{
                this.view.clearActive()
            })
        },
    }
    controller.init(view, model)
}