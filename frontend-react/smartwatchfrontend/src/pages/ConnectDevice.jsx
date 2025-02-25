import React from "react";
import "../style/device.css";
import watchImage from "../images/watch.jpg";

function ConnectDevice() {
  return (
    <div className="device-container">
      <h2 className="device-title">CONNECT WITH YOUR DEVICE</h2>

      <div className="device-card">
        <img src={watchImage} alt="Smartwatch" className="device-image" />

        <div className="button-group">
          <button className="btn btn-one">Scan devices</button>
          <button className="btn btn-two">Synchronize</button>
        </div>
      </div>
    </div>
  );
}

export default ConnectDevice;

/*izgled:gore slika sata ispod 2dugmeta scan devices i sychronize*/

/*ideja: */
/*biranje device klikne na scan devices i prikazu mu se 5random uredjaja */
/*odabere 1 i onda klikne sinhronizuj uredjaj i onda se za id tog device kreira healthdata*/
/*nakon sto se kreira healthdata dobije se poruka uspesno sinhronizovani podaci sa uredjaja! */
