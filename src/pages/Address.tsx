import { useState, useEffect } from 'react';
import "typeface-roboto";
import Header from '../components/Header';
import Footer from '../components/Footer';
import folhagem from '../images/folhagem.jpg';
import { FaMapMarkerAlt, FaMapMarker } from "react-icons/fa";
import { IoMdRemoveCircle, IoIosAddCircle } from "react-icons/io";
import "typeface-roboto";

import '../App.css';

import { api } from '../utils/api';

import { useLocation, useHistory } from 'react-router-dom';

import { useMercadopago } from 'react-sdk-mercadopago';

import { config } from 'dotenv';
config();

type AddressFromDb = {
  id: number,
  house_number: number,
  street_name: string,
  zip_code: string
}

type Address = {
  cep: string,
  state: string,
  city: string,
  street: string,
  neighborhood: string,
}

type IAddress = {
  house_number: number,
  street_name: string,
  zip_code: string
  cep: string,
  state: string,
  city: string,
  street: string,
  neighborhood: string,
}

function Address() {
  let history = useHistory();
  let location: any = useLocation();

  const [preferenceId, setPreferenceId] = useState('');
  const [products, setProducts] = useState<any>([]);

  useEffect(() => {
    if (location.state)
      if (location.state.products)
        setProducts([...location.state.products]);
  }, []);

  const mercadopago = useMercadopago.v2("TEST-bcfd2dc6-1894-4262-90a4-7b4d70bbb791", {
    locale: 'pt-BR'
  });

  useEffect(() => {
    if (mercadopago && preferenceId) {
      mercadopago.checkout({
        preference: {
          id: preferenceId,
        },
        render: {
          container: '.cho-container',
          label: 'Confirmar',
        }
      })
    }
  }, [mercadopago, preferenceId])

  const [addresses, setAddresses] = useState<AddressFromDb[]>([]);

  const getAddresses = async () => {
    try {
      const { data } = await api.get('/addresses', {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('@token/sustentalize')
        }
      });

      setAddresses(data.addresses);
    } catch (err: any) {
      console.log(err.message);
    }
  }

  useEffect(() => {
    getAddresses();
  }, []);

  const createPreference = async (selectedAddress: AddressFromDb) => {
    try {
      const { data } = await api.post('/preference', {
        selectedAddress,
        products: JSON.parse(String(localStorage.getItem('@products/sustentalize')))
      }, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('@token/sustentalize')
        }
      });

      localStorage.removeItem('@products/sustentalize');

      setPreferenceId(data.preferenceId);
    } catch (err: any) {
      console.log(err.message);
    }
  }

  const createBuyPreference = async (selectedAddress: AddressFromDb) => {
    try {
      const { data } = await api.post('/preference', {
        selectedAddress,
        products
      }, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('@token/sustentalize')
        }
      });

      setPreferenceId(data.preferenceId);
    } catch (err: any) {
      console.log(err.message);
    }
  }
  
  const removeAddress = async (id: number) => {
    try {
      await api.delete(`/address/${id}`, { 
        headers: { 
          'Authorization': 'Bearer ' + localStorage.getItem('@token/sustentalize') 
        } 
      });
      
      setAddresses([ ...addresses.filter((address: any) => address.id !== id) ]);
    } catch (err: any) {
      console.log(err.message);
    }
  }

  return (
    <div className="App">
      <div className="header">
        <Header />
      </div>
      <div>
        <div className="right-side">
          <div className="left-side">
            <div className="text-1-left-side">
              Revise e confirme sua compra
              <p style={{ fontSize: 15, marginTop: 50, marginRight: 140 }}>Detalhes de envio</p>
            </div>
            {
              addresses.length > 0 ? addresses.map(address => {
                return (
                  <div className="adress-box" onClick={() => {
                    if (products.length > 0)
                      return createBuyPreference(address);
                    return createPreference(address);
                  }}>
                    <div className="map-icon-area">
                      <FaMapMarkerAlt />
                    </div>
                    <div className="remove-adress cursor-pointer" onClick={() => removeAddress(address.id)}>
                      <a><IoMdRemoveCircle size={30} color="#d94f5c" /></a>
                    </div>
                    <div className="adress-text">
                      {address.street_name}
                      <div className="street-text">
                        {address.zip_code}, {address.house_number}
                      </div>
                    </div>
                  </div>
                )
              }) : null
            }
            <div className="add-adress" onClick={() => history.push('/add/address')}>
              <div className="map-icon-area">
                <FaMapMarker />
              </div>
              <div className="add-adress-icon">
                <a href="#"><IoIosAddCircle size={30} color="#d94f5c" /></a>
              </div>
              <div className="add-text">
                <a>Adicionar novo endereço</a>
              </div>
            </div>
            <div className="end-buy">
              <div className="cho-container" />
            </div>
          </div>
          <img src={folhagem} className="image-right" alt="image-right" />
        </div>

      </div>
      <div className="footer-1">
        <div className="footer-1-text">
          Que tal levar a sustentabilidade<br></br>pra dentro de sua casa?
        </div>
        <div className="footer-1-subtext">
          ana.111811@alunosatc.edu.br<br></br>
          (48) 99651-6580<br></br>
          Rua Marechal Floriano Peixoto, Criciúma, Santa Catarina - 88801-040<br></br>
          Atendimento Online
        </div>

        <Footer />

      </div>
    </div>
  );
}

export default Address;