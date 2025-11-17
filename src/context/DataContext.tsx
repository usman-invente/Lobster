import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Tank,
  OffloadRecord,
  ReceivingBatch,
  CrateLineItem,
  LooseStock,
  Loss,
  Dispatch,
  SizeCategory,
  TankStock,
  BoatTripStock,
  StockSummary
} from '../types';

interface DataContextType {
  // State
  currentUser: User | null;
  users: User[];
  tanks: Tank[];
  offloadRecords: OffloadRecord[];
  receivingBatches: ReceivingBatch[];
  crates: CrateLineItem[];
  looseStock: LooseStock[];
  losses: Loss[];
  dispatches: Dispatch[];
  
  // Actions
  setCurrentUser: (user: User | null) => void;
  addUser: (user: User) => void;
  addTank: (tank: Tank) => void;
  updateTank: (tank: Tank) => void;
  addOffloadRecord: (record: OffloadRecord) => void;
  addReceivingBatch: (batch: ReceivingBatch, crates: CrateLineItem[]) => void;
  updateCrate: (crate: CrateLineItem) => void;
  addLooseStock: (stock: LooseStock) => void;
  updateLooseStock: (stock: LooseStock) => void;
  addLoss: (loss: Loss) => void;
  addDispatch: (dispatch: Dispatch) => void;
  
  // Computed
  getTankStock: (tankId: string) => TankStock | null;
  getAllTankStock: () => TankStock[];
  getStockBySize: () => StockSummary;
  getBoatTripStock: () => BoatTripStock[];
  getAvailableCrates: () => number[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [offloadRecords, setOffloadRecords] = useState<OffloadRecord[]>([]);
  const [receivingBatches, setReceivingBatches] = useState<ReceivingBatch[]>([]);
  const [crates, setCrates] = useState<CrateLineItem[]>([]);
  const [looseStock, setLooseStock] = useState<LooseStock[]>([]);
  const [losses, setLosses] = useState<Loss[]>([]);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);

  // Initialize data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('lobsterStockData');
    if (savedData) {
      const data = JSON.parse(savedData);
      setUsers(data.users || []);
      setTanks(data.tanks || []);
      setOffloadRecords(data.offloadRecords || []);
      setReceivingBatches(data.receivingBatches || []);
      setCrates(data.crates || []);
      setLooseStock(data.looseStock || []);
      setLosses(data.losses || []);
      setDispatches(data.dispatches || []);
    } else {
      // Initialize default tanks (20 tanks)
      const defaultTanks: Tank[] = Array.from({ length: 20 }, (_, i) => ({
        id: `tank-${i + 1}`,
        number: i + 1,
        name: `Tank ${i + 1}`,
        active: true,
      }));
      setTanks(defaultTanks);
      
      // Create default admin user
      const defaultUser: User = {
        id: 'user-1',
        name: 'Admin',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      setUsers([defaultUser]);
      setCurrentUser(defaultUser);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    const data = {
      users,
      tanks,
      offloadRecords,
      receivingBatches,
      crates,
      looseStock,
      losses,
      dispatches,
    };
    localStorage.setItem('lobsterStockData', JSON.stringify(data));
  }, [users, tanks, offloadRecords, receivingBatches, crates, looseStock, losses, dispatches]);

  // Actions
  const addUser = (user: User) => setUsers([...users, user]);
  
  const addTank = (tank: Tank) => setTanks([...tanks, tank]);
  
  const updateTank = (tank: Tank) => {
    setTanks(tanks.map(t => t.id === tank.id ? tank : t));
  };
  
  const addOffloadRecord = (record: OffloadRecord) => {
    setOffloadRecords([...offloadRecords, record]);
  };
  
  const addReceivingBatch = (batch: ReceivingBatch, cratesToAdd: CrateLineItem[]) => {
    setReceivingBatches([...receivingBatches, batch]);
    setCrates([...crates, ...cratesToAdd]);
  };
  
  const updateCrate = (crate: CrateLineItem) => {
    setCrates(crates.map(c => c.id === crate.id ? crate : c));
  };
  
  const addLooseStock = (stock: LooseStock) => {
    setLooseStock([...looseStock, stock]);
  };
  
  const updateLooseStock = (stock: LooseStock) => {
    setLooseStock(looseStock.map(s => s.id === stock.id ? stock : s));
  };
  
  const addLoss = (loss: Loss) => {
    setLosses([...losses, loss]);
    
    // Update the affected stock
    if (loss.crateId) {
      const crate = crates.find(c => c.id === loss.crateId);
      if (crate) {
        updateCrate({ ...crate, kg: Math.max(0, crate.kg - loss.kg) });
      }
    } else if (loss.looseStockId) {
      const stock = looseStock.find(s => s.id === loss.looseStockId);
      if (stock) {
        updateLooseStock({ ...stock, kg: Math.max(0, stock.kg - loss.kg) });
      }
    }
  };
  
  const addDispatch = (dispatch: Dispatch) => {
    setDispatches([...dispatches, dispatch]);
    
    // Update crates and loose stock
    dispatch.lineItems.forEach(item => {
      if (item.crateId) {
        const crate = crates.find(c => c.id === item.crateId);
        if (crate) {
          const newKg = Math.max(0, crate.kg - item.kg);
          updateCrate({
            ...crate,
            kg: newKg,
            status: newKg === 0 ? 'dispatched' : crate.status,
          });
        }
      } else if (item.looseStockId) {
        const stock = looseStock.find(s => s.id === item.looseStockId);
        if (stock) {
          updateLooseStock({ ...stock, kg: Math.max(0, stock.kg - item.kg) });
        }
      }
    });
  };

  // Computed functions
  const getTankStock = (tankId: string): TankStock | null => {
    const tank = tanks.find(t => t.id === tankId);
    if (!tank) return null;

    const tankCrates = crates.filter(c => c.tankId === tankId && c.status === 'stored' && c.kg > 0);
    const tankLooseStock = looseStock.filter(s => s.tankId === tankId && s.kg > 0);

    const summary: StockSummary = {
      totalKg: 0,
      sizeU: 0,
      sizeA: 0,
      sizeB: 0,
      sizeC: 0,
      sizeD: 0,
      sizeE: 0,
    };

    tankCrates.forEach(crate => {
      summary.totalKg += crate.kg;
      summary[`size${crate.size}` as keyof StockSummary] += crate.kg;
    });

    tankLooseStock.forEach(stock => {
      summary.totalKg += stock.kg;
      summary[`size${stock.size}` as keyof StockSummary] += stock.kg;
    });

    return {
      tankId: tank.id,
      tankNumber: tank.number,
      tankName: tank.name,
      crates: tankCrates,
      looseStock: tankLooseStock,
      summary,
    };
  };

  const getAllTankStock = (): TankStock[] => {
    return tanks.filter(t => t.active).map(t => getTankStock(t.id)!).filter(Boolean);
  };

  const getStockBySize = (): StockSummary => {
    const summary: StockSummary = {
      totalKg: 0,
      sizeU: 0,
      sizeA: 0,
      sizeB: 0,
      sizeC: 0,
      sizeD: 0,
      sizeE: 0,
    };

    crates.forEach(crate => {
      if (crate.status === 'stored' && crate.kg > 0) {
        summary.totalKg += crate.kg;
        summary[`size${crate.size}` as keyof StockSummary] += crate.kg;
      }
    });

    looseStock.forEach(stock => {
      if (stock.kg > 0) {
        summary.totalKg += stock.kg;
        summary[`size${stock.size}` as keyof StockSummary] += stock.kg;
      }
    });

    return summary;
  };

  const getBoatTripStock = (): BoatTripStock[] => {
    const tripMap = new Map<string, BoatTripStock>();

    offloadRecords.forEach(offload => {
      const key = `${offload.boatName}-${offload.offloadDate}-${offload.tripNumber}`;
      tripMap.set(key, {
        boatName: offload.boatName,
        offloadDate: offload.offloadDate,
        tripNumber: offload.tripNumber,
        totalLive: offload.totalKgAlive,
        totalDead: offload.totalKgDead + offload.deadOnTanks,
        totalRotten: offload.totalKgRotten + offload.rottenOnTanks,
        totalLost: 0,
        totalDispatched: 0,
        remaining: {
          totalKg: 0,
          sizeU: 0,
          sizeA: 0,
          sizeB: 0,
          sizeC: 0,
          sizeD: 0,
          sizeE: 0,
        },
      });
    });

    // Calculate remaining stock per boat/trip
    crates.forEach(crate => {
      if (crate.status === 'stored' && crate.kg > 0) {
        const key = `${crate.boatName}-${crate.offloadDate}`;
        const trips = Array.from(tripMap.values()).filter(t => 
          t.boatName === crate.boatName && t.offloadDate === crate.offloadDate
        );
        if (trips.length > 0) {
          const trip = trips[0];
          trip.remaining.totalKg += crate.kg;
          trip.remaining[`size${crate.size}` as keyof StockSummary] += crate.kg;
        }
      }
    });

    looseStock.forEach(stock => {
      if (stock.kg > 0 && stock.boatName && stock.offloadDate) {
        const key = `${stock.boatName}-${stock.offloadDate}`;
        const trips = Array.from(tripMap.values()).filter(t => 
          t.boatName === stock.boatName && t.offloadDate === stock.offloadDate
        );
        if (trips.length > 0) {
          const trip = trips[0];
          trip.remaining.totalKg += stock.kg;
          trip.remaining[`size${stock.size}` as keyof StockSummary] += stock.kg;
        }
      }
    });

    // Calculate losses
    losses.forEach(loss => {
      const crate = loss.crateId ? crates.find(c => c.id === loss.crateId) : null;
      const stock = loss.looseStockId ? looseStock.find(s => s.id === loss.looseStockId) : null;
      
      const boatName = crate?.boatName || stock?.boatName;
      const offloadDate = crate?.offloadDate || stock?.offloadDate;
      
      if (boatName && offloadDate) {
        const trips = Array.from(tripMap.values()).filter(t => 
          t.boatName === boatName && t.offloadDate === offloadDate
        );
        if (trips.length > 0) {
          const trip = trips[0];
          if (loss.type === 'dead') trip.totalDead += loss.kg;
          else if (loss.type === 'rotten') trip.totalRotten += loss.kg;
          else if (loss.type === 'lost') trip.totalLost += loss.kg;
        }
      }
    });

    // Calculate dispatched
    dispatches.forEach(dispatch => {
      dispatch.lineItems.forEach(item => {
        const crate = item.crateId ? crates.find(c => c.id === item.crateId) : null;
        const stock = item.looseStockId ? looseStock.find(s => s.id === item.looseStockId) : null;
        
        const boatName = crate?.boatName || stock?.boatName;
        const offloadDate = crate?.offloadDate || stock?.offloadDate;
        
        if (boatName && offloadDate) {
          const trips = Array.from(tripMap.values()).filter(t => 
            t.boatName === boatName && t.offloadDate === offloadDate
          );
          if (trips.length > 0) {
            trips[0].totalDispatched += item.kg;
          }
        }
      });
    });

    return Array.from(tripMap.values());
  };

  const getAvailableCrates = (): number[] => {
    const usedCrates = new Set(crates.map(c => c.crateNumber));
    const available: number[] = [];
    for (let i = 1; i <= 300; i++) {
      if (!usedCrates.has(i)) {
        available.push(i);
      }
    }
    return available;
  };

  return (
    <DataContext.Provider
      value={{
        currentUser,
        users,
        tanks,
        offloadRecords,
        receivingBatches,
        crates,
        looseStock,
        losses,
        dispatches,
        setCurrentUser,
        addUser,
        addTank,
        updateTank,
        addOffloadRecord,
        addReceivingBatch,
        updateCrate,
        addLooseStock,
        updateLooseStock,
        addLoss,
        addDispatch,
        getTankStock,
        getAllTankStock,
        getStockBySize,
        getBoatTripStock,
        getAvailableCrates,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
