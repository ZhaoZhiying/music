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
            let {songs, selectSongId} = data
            let liList = songs.map((song)=>{
                let $li = $('<li></li>').text(song.name).attr('dataSongId' ,song.id)
                if(song.id === selectSongId){
                    $li.addClass('active')
                }
                return $li
            })
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
            selectSongId: undefined,
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
                let songId = e.currentTarget.getAttribute('dataSongId')
                //选中的歌曲记录到 model 里，然后刷新视图
                this.model.data.selectSongId = songId
                this.view.render(this.model.data)
                
                //获取歌曲的完整信息，通知给其他模块
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
            window.eventHub.on('update', (song)=>{
                let songs = this.model.data.songs
                for(let i=0; i<songs.length; i++){
                    if(songs[i].id === song.id){
                        songs[i] = song
                    }
                }
                this.view.render(this.model.data)
            })
        },
    }
    controller.init(view, model)
}