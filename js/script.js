cv['onRuntimeInitialized'] = function () {
    const inputImagem = document.querySelector('#inputImage');
    const btnAlterar = document.querySelector('#btnAlterar');
    const statusEl = document.querySelector('#status');
    let src;
    statusEl.textContent = 'OpenCV.js carregado. Selecione uma imagem';


    inputImagem.addEventListener('change', function (e) {
        if (!e.target.files[0]) return;
        const img = document.createElement('img');
        img.src = URL.createObjectURL(e.target.files[0]);
        img.onload = () => {
            if (src) src.delete();
            src = cv.imread(img);
            btnAlterar.disabled = false;
            statusEl.textContent = 'Imagem Carregada. Clique em Gerar Canvas'
        }
    })

    btnAlterar.addEventListener('click', function () {
        //gaussian blur
        let gauss = new cv.Mat();
        cv.GaussianBlur(src, gauss, new cv.Size(19, 19), 0);
        cv.imshow('canvasGaussianBlur', gauss);



        //blur
        let media = new cv.Mat();
        cv.blur(src, media, new cv.Size(19, 19));
        cv.imshow('canvasBlur', media);



        //original com recorte
        let mascaraOriginal = new cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC1);
        let centroOriginal = new cv.Point(src.cols / 2, src.rows / 2);
        let raioOriginal = Math.min(src.cols, src.rows) / 5;
        cv.circle(mascaraOriginal, centroOriginal, raioOriginal, new cv.Scalar(255), -1);

        let recorteANDOriginal = new cv.Mat();
        cv.bitwise_and(src, src, recorteANDOriginal, mascaraOriginal);
        cv.imshow('canvasOriginalMascara', recorteANDOriginal);



        //gaussian blur com recorte
        let mascaraGaussianBlur = new cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC1);
        let centroGaussianBlur = new cv.Point(src.cols / 2, src.rows / 2);
        let raioGaussianBlur = Math.min(src.cols, src.rows) / 2.5;
        cv.circle(mascaraGaussianBlur, centroGaussianBlur, raioGaussianBlur, new cv.Scalar(255), -1);

        let recorteANDGaussianBlur = new cv.Mat();
        cv.bitwise_and(gauss, gauss, recorteANDGaussianBlur, mascaraGaussianBlur);
        cv.imshow('canvasGaussianBlurMascara', recorteANDGaussianBlur);
        gauss.delete();



        //sobreposição pelo gaussian blur
        let mascaraInvertidaGauss = new cv.Mat();
        cv.bitwise_not(mascaraGaussianBlur, mascaraInvertidaGauss);

        let blurRecorte = new cv.Mat();
        cv.bitwise_and(media, media, blurRecorte, mascaraInvertidaGauss);

        let sopreposicaoGauss = new cv.Mat();
        cv.add(recorteANDGaussianBlur, blurRecorte, sopreposicaoGauss);
        cv.imshow('canvasGaussianBlurSobreposicao', sopreposicaoGauss);
        media.delete();
        recorteANDGaussianBlur.delete();
        mascaraGaussianBlur.delete();
        mascaraInvertidaGauss.delete();
        blurRecorte.delete();

        

        //sobreposição pela original
        let mascaraInvertidaOriginal = new cv.Mat();
        cv.bitwise_not(mascaraOriginal, mascaraInvertidaOriginal);

        let originalRecorte = new cv.Mat();
        cv.bitwise_and(sopreposicaoGauss, sopreposicaoGauss, originalRecorte, mascaraInvertidaOriginal);

        let sopreposicaoOriginal = new cv.Mat();
        cv.add(recorteANDOriginal, originalRecorte, sopreposicaoOriginal);
        cv.imshow('canvasOriginalSobreposicao', sopreposicaoOriginal);
        recorteANDOriginal.delete();
        mascaraOriginal.delete();
        sopreposicaoGauss.delete();
        mascaraInvertidaOriginal.delete();
        originalRecorte.delete();
        sopreposicaoOriginal.delete();

        statusEl.textContent = 'Conversão concluída!';
    })
}