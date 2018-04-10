{
    let view = {
        el: '.playlist-wrapper',
        template: `
            <ul class="playlist"></ul>
        `,
        render(data){
            let $el = $(this.el)
            $el.html(this.template)
            //创建 li
            let {songs} = data
            let liList = songs.map((song)=>{return $('<li></li>').text(song.name)})
            $el.find('ul').empty()
            liList.map((li)=>{
                $el.find('ul').append(li)
            })
        },
        clearActive(){
            $(this.el).find('.active').removeClass('active')
        }
    }
    let model = {
        data: {
            songs: [],
        }
    }
    let controller = {
        init(view, model){
            this.view = view
            this.model = model
            this.view.render(this.model.data)
            window.eventHub.on('upload', ()=>{
                this.view.clearActive()
            })
            //监听创建 song 事件
            window.eventHub.on('create', (songData)=>{ 
                this.model.data.songs.push(songData)
                this.view.render(this.model.data)
            })
        }
    }
    controller.init(view, model)
}