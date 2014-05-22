/**
 * app.js
 *
 * This file contains some conventional defaults for working with Socket.io + Sails.
 * It is designed to get you up and running fast, but is by no means anything special.
 *
 * Feel free to change none, some, or ALL of this file to fit your needs!
 */


(function (io) {

  // as soon as this file is loaded, connect automatically, 
  var socket = io.connect();
  if (typeof console !== 'undefined') {
    log('Connecting to Sails.js...');
  }

  socket.on('connect', function socketConnected() {

    // Listen for Comet messages from Sails
    socket.on('message', function messageReceived(message) {

      ///////////////////////////////////////////////////////////
      // Replace the following with your own custom logic
      // to run when a new message arrives from the Sails.js
      // server.
      ///////////////////////////////////////////////////////////
      //log('New comet message received :: ', message);
      //////////////////////////////////////////////////////
      

    });

    // permite generar una session con este usuario y comprobar si tiene una 
    // sesion ya disponible
    socket.post('/chat/insert');
    //console.log(socket);
    ///////////////////////////////////////////////////////////
    // Here's where you'll want to add any custom logic for
    // when the browser establishes its socket connection to 
    // the Sails.js server.
    ///////////////////////////////////////////////////////////
    log(
        'Socket is now connected and globally accessible as `socket`.\n' + 
        'e.g. to send a GET request to Sails, try \n' + 
        '`socket.get("/", function (response) ' +
        '{ console.log(response); })`'
    );
    ///////////////////////////////////////////////////////////

    // no hace nada
    socket.on('tabla',function(message){
        
        socket.post('/chat/global',function(err,message){alert(message)});
        
    });
    
    // no hace nada
    socket.on('sessions',function(message){console.log(message)});
    
    // inserta una nueva fila en la tabla con el nuevo usuario
    socket.on('insertInTable',function(message){
        $('table').append("<tr id="+message.id+"><td>"+message.username+"</td><td class='show_profile'><a href='#' id="+message.id+">show profile</a></td></tr>");
        language.showProfile();
    });
    
    // borra una fila con el usuario eliminado
    socket.on('removeInTable',function(message){
       $('#'+message).remove();
    });
    
    socket.on('request',function(message){
       console.log(message);
       $('#request').append('<div id=room-'+message.room+'>Peticion de: '+message.username+'<button id=r-'+message.room+'>Rechazar</button><button id=a-'+message.room+'>Aceptar</button></div>');
       
       // pone un evento al boton de rechazar
       $('#r-'+message.room).on('click',function(event){
           alert('entra en rechazar');
           socket.post('/chat/reject',{id: message.room},function(data){
              $('#room-'+data.id).remove();
              language.message($('#js-alert'),'has rechazado al invitacion','info');
           });
       });
       
       // pone un evento al boton de aceptar
       $('#a-'+message.room).on('click',function(event){
           alert('entraaa en aceptar')
           socket.post('/chat/accept',{id: message.room},function(data){
              $('#room-'+data.id).remove();
              language.message($('#js-alert'),'has aceptado la invitacion','info');
           });
       });
    });
    
    // permite mostrar mensajes al usuario
    socket.on('info',function(message){
        language.message($('#js-alert'),message.message,message.type);
    });
    
    // permite recibir la peticion de generar un chat privado
    socket.on('createPrivateRoom',function(data){
        
        // Genero el chat privado
        $.get('/chat/getPrivateRoom',{info: data},function(room){
            // añade el chat a la pagina
            $('#privated-chats').append(room);
            // configura un evento de click al boton enviar
            $('#b-'+data.id).on('click',function(event){
                var text = $('#t-'+data.id).val();
                socket.post('/chat/send',{room: data.id,message: text},function(sended){
                    if(!sended){
                        language.message($('#js-alert'),'No se ha podido enviar el mensaje','warning');
                    }
                    $('#t-'+data.id).val('');
                });
            });
            
            
            //enlace de video evento click
            $('#v-'+data.id).on('click',function(){

                socket.post('/chat/videoPetition',{id: data.id});

            });

            // cierra la conexion de ambos, al dejar la habitacion
            $('#close-'+data.id).on('click',function(event){

                alert('cerrar');
                // cierro la habitacion
                language.webrtc.leaveRoom();
                
            });
            
            language.upload(data.id);
            $(document).foundation();
                
        })
        
    })
    
    // recibe un mensaje de otro usuario enviado por el chat y lo pega
    socket.on('send',function(data){
       
       $('#c-'+data.id).append('<li><strong>'+data.username+'</strong>: '+data.message+'</li>');
       
    });
    
    // recive las peticiones,chat y mensajes que tenga abierto
    socket.on('recovery',function(data){
        
        // recorre todfas las peticiones que tiene y las muestra
        data.petitions.forEach(function(value,key){
            $('#request').append('<div id=room-'+value.id+'>Peticion de: '+value.username+'<button id=r-'+value.id+'>Rechazar</button><button id=a-'+value.id+'>Aceptar</button></div>');
       
            // pone un evento al boton de rechazar
            $('#r-'+value.id).on('click',function(event){
                //alert('entra en rechazar');
                socket.post('/chat/reject',{id: value.id},function(data){
                   $('#room-'+data.id).remove();
                   language.value($('#js-alert'),'has rechazado al invitacion','info');
                });
            });

            // pone un evento al boton de aceptar
            $('#a-'+value.id).on('click',function(event){
                //alert('entraaa en aceptar')
                socket.post('/chat/accept',{id: value.id},function(data){
                   $('#room-'+data.id).remove();
                   language.value($('#js-alert'),'has aceptado la invitacion','info');
                });
            }); 
        });
        
        // Pone las habitaccion en el que esta el usuario
        data.rooms.forEach(function(value,key){
           console.log('habitacioness');
                $.get('/chat/getPrivateRoom',{info: value},function(room){
                // añade el chat a la pagina
                $('#privated-chats').append(room);
                // configura un evento de click al boton enviar
                $('#b-'+value.id).on('click',function(event){

                    var text = $('#t-'+value.id).val();
                    socket.post('/chat/send',{room: value.id, message: text},function(sended){
                        if(!sended){
                            language.message($('#js-alert'),'No se ha podido enviar el mensaje','warning');
                        }
                        $('#t-'+value.id).val('');
                    });
                });

                //enlace de video evento click

                $('#v-'+value.id).on('click',function(){

                    socket.post('/chat/videoPetition',{id: value.id});

                });

                // cierra la conexion de ambos, al dejar la habitacion
                $('#close-'+value.id).on('click',function(event){

                    alert('cerrar');
                    // debo la habitacion
                    language.webrtc.leaveRoom();


                });
                
                language.upload(value.id);
                language.prueba();
            
            });
             
        });
        
        // muestra el mensaje de que alguien ha querido realizar una peticion de video
        socket.on('video',function(data){
            console.log(language);
            
            if(typeof language.webrtc == 'undefined'){
                $('#c-'+data.id).append(
                        '<li class="infoInChat">El usuario: <strong>'+
                        data.username+'</strong> ha realizado una peticion de video \n\
                        <a id="av-'+data.id+'">Aceptar</a><a id="rv-'+data.id+'">Rechazar</a></li>');

                $('#av-'+data.id).on('click',function(event){

                    socket.post('/chat/acceptVideo',{id: data.id});

                });

                $('#rv-'+data.id).on('click',function(event){

                    socket.post('/chat/rejectVideo',{id: data.id});

                    // Elimino los eventos de aceptar y rechazar video
                    $('#rv-'+data.id).off('click');
                    $('#av-'+data.id).off('click');

                });
            }
            else{
                socket.post('/chat/message',{id: data.id,message: 'El usuario no puede iniciar el video',type: 'info'})
            }
            
        });
        
        // Cuando se lo pidan, inicia un video peer to peer
        socket.on('startVideo',function(data){
                alert('entra en start video');
                language.webrtc = new SimpleWebRTC({
                   
                    // the id/element dom element that will hold remote videos

                    remoteVideosEl: 'remote-'+data.id,
                    debug: false,
                    url: 'http://192.168.1.33:8888',
                    // immediately ask for camera access
                    autoRequestMedia: true
                });
                
                // Cuando esta preparada para llamar, te conectas
                language.webrtc.on('readyToCall', function () {
                    // you can name it anything
                    
                    language.webrtc.joinRoom('remote-'+data.id);
                    
                });
            
        })
        
        $(document).foundation();
    });
    
    
    
    
    
    
    
    
    
  });


  // Expose connected `socket` instance globally so that it's easy
  // to experiment with from the browser console while prototyping.
  window.socket = socket;


  // Simple log function to keep the example simple
  function log () {
    if (typeof console !== 'undefined') {
      console.log.apply(console, arguments);
    }
  }
  

})(

  // In case you're wrapping socket.io to prevent pollution of the global namespace,
  // you can replace `window.io` with your own `io` here:
  window.io

);
